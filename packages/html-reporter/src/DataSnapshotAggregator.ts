import { readFileSync } from 'node:fs';

import type { FileSystem } from '@serenity-js/core/io';
import type { RequirementsHierarchy } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';
import {
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
} from '@serenity-js/core/model';
import { marked } from 'marked';

import { scoreCapability,scoreDirectory } from './CapabilityConfidenceScorer.js';
import type { ActivityRecord, RunData, SceneRecord } from './model/RunData.js';
import { IncompatibleSchemaError, InvalidRunDataError, validateRunData } from './model/validation.js';
import type { ReportActivity, ReportCapabilityNode, ReportData, ReportExecutionHistoryEntry, ReportHistoryEntry, ReportOutcomes, ReportScenario, ReportSystemContext } from './ReportData.js';
import { CURRENT_REPORT_DATA_SCHEMA_VERSION } from './ReportData.js';

interface AggregatorConfig {
    consistencyWindow: number;
    maxHistory?: number;
    title?: string;
}

/**
 * Reads all test-runs db.json files and produces the aggregated data.js snapshot.
 *
 * @package
 */
export class DataSnapshotAggregator {

    constructor(
        private readonly fileSystem: FileSystem,
        private readonly config: AggregatorConfig,
        private readonly requirementsHierarchy?: RequirementsHierarchy,
        private readonly projectFileSystem?: FileSystem,
        private readonly sourceFileSystem?: FileSystem,
    ) {
    }

    aggregate(externalRunPaths?: string[]): void {
        let allRuns = externalRunPaths
            ? this.loadExternalRuns(externalRunPaths)
            : (() => {
                const runDirectories = this.findRunDirectories();
                this.pruneOldRuns(runDirectories);
                return this.loadRuns(runDirectories);
            })();

        if (allRuns.length === 0) {
            return;
        }

        // In external mode, enforce maxHistory by slicing the sorted runs array,
        // then prune output dirs that fall outside the window.
        if (externalRunPaths && this.config.maxHistory) {
            if (allRuns.length > this.config.maxHistory) {
                allRuns = allRuns.slice(allRuns.length - this.config.maxHistory);
            }
            this.pruneOldRuns(this.findRunDirectories());
        }

        const latestRun = allRuns[allRuns.length - 1];
        const { newFailures, newPasses } = this.computeDegradedRecovered(allRuns);

        const snapshot: ReportData = {
            schemaVersion: CURRENT_REPORT_DATA_SCHEMA_VERSION,
            summary: this.buildSummary(latestRun),
            scenarios: this.enrichScenarios(latestRun, allRuns),
            history: this.buildHistory(allRuns),
            tags: this.computeTagStats(latestRun),
            inconsistentTests: this.identifyUnstableTests(allRuns),
            newFailures,
            newPasses,
            systemContext: this.buildSystemContext(latestRun),
            capabilities: this.requirementsHierarchy ? this.buildCapabilities(latestRun, allRuns) : undefined,
        };

        const js = `window.__SERENITY_REPORT_DATA__ = ${ JSON.stringify(snapshot, undefined, 2) };\n`;
        this.fileSystem.storeSync(Path.from('data.js'), js, 'utf8');
    }

    private pruneOldRuns(runDirectories: Path[]): void {
        if (this.config.maxHistory && runDirectories.length > this.config.maxHistory) {
            const toRemove = runDirectories.slice(0, runDirectories.length - this.config.maxHistory);
            for (const directory of toRemove) {
                this.fileSystem.removeSync(directory);
            }
            runDirectories.splice(0, runDirectories.length - this.config.maxHistory);
        }
    }

    private loadRuns(runDirectories: Path[]): RunData[] {
        const runs: RunData[] = [];

        for (const directory of runDirectories) {
            const databaseJsonPath = directory.join(Path.from('db.json'));
            try {
                const content = this.fileSystem.readFileSync(databaseJsonPath, { encoding: 'utf8' }) as string;
                const raw = JSON.parse(content);
                runs.push(validateRunData(raw, databaseJsonPath.value));
            } catch (error) {
                if (error instanceof InvalidRunDataError || error instanceof IncompatibleSchemaError || error instanceof SyntaxError) {
                    // Skip invalid files — log to stderr and continue
                     
                    console.warn(`[html-reporter] Skipping ${databaseJsonPath.value}: ${(error as Error).message}`);
                    continue;
                }
                throw error;
            }
        }

        return runs;
    }

    private loadExternalRuns(paths: string[]): RunData[] {
        const sourceFs = this.sourceFileSystem;

        // Step 1: load all db.json files and group by testRunId (or startedAt as fallback)
        const groups = new Map<string, RunData[]>();

        for (const databaseJsonPath of paths) {
            let content: string;
            let run: RunData;
            try {
                content = sourceFs
                    ? sourceFs.readFileSync(Path.from(databaseJsonPath), { encoding: 'utf8' }) as string
                    : readFileSync(databaseJsonPath, 'utf8');
                const raw = JSON.parse(content);
                run = validateRunData(raw, databaseJsonPath);
            } catch (error) {
                if (error instanceof InvalidRunDataError || error instanceof IncompatibleSchemaError || error instanceof SyntaxError) {
                     
                    console.warn(`[html-reporter] Skipping ${databaseJsonPath}: ${(error as Error).message}`);
                    continue;
                }
                throw error;
            }
            const groupId = run.testRunId || run.startedAt;

            if (!groups.has(groupId)) {
                groups.set(groupId, []);
            }
            groups.get(groupId).push(run);

            // Copy sibling artifacts before any merging.
            // The source path structure is either:
            //   .../test-runs/{buildId}/{jobName}-{attempt}/db.json  (CI nested)
            //   .../test-runs/{timestamp}/db.json                    (local flat)
            const pathWithoutDatabase = databaseJsonPath.replace(/\/db\.json$/, '');
            const testRunsIndex = pathWithoutDatabase.lastIndexOf('/test-runs/');
            if (testRunsIndex !== -1) {
                const relative = pathWithoutDatabase.slice(testRunsIndex + '/test-runs/'.length); // e.g. "42/playwright-test-1" or "2024-06-15T14:30:00Z"
                const slashIndex = relative.indexOf('/');
                if (slashIndex !== -1) {
                    // CI nested: test-runs/{buildId}/{subDirectory}
                    const artifactRunId = relative.slice(0, slashIndex);
                    const subDirectory = relative.slice(slashIndex + 1);
                    this.copyArtifactsFromSource(databaseJsonPath, artifactRunId, subDirectory);
                } else {
                    // Local flat: test-runs/{timestamp} — copy directly into top-level dir
                    this.copyArtifactsFromSource(databaseJsonPath, relative, '.');
                }
            }
        }

        // Step 2 & 3: within each group, sub-group by attempt → additive merge, then retry merge
        const mergedRuns: RunData[] = [];

        for (const [runId, runsInGroup] of groups) {
            // Sub-group by attempt number (missing attempt defaults to 1)
            const byAttempt = new Map<number, RunData[]>();
            for (const run of runsInGroup) {
                const attempt = run.attempt ?? 1;
                if (!byAttempt.has(attempt)) {
                    byAttempt.set(attempt, []);
                }
                byAttempt.get(attempt).push(run);
            }

            // Additive merge within each attempt
            const attemptNumbers = [...byAttempt.keys()].sort((a, b) => a - b);
            const mergedByAttempt: RunData[] = attemptNumbers.map(attemptNumber => {
                const runsForAttempt = byAttempt.get(attemptNumber);
                return runsForAttempt.reduce((merged, run) => this.mergeAdditively(merged, run));
            });

            // Retry merge across attempts (in order)
            const finalRun = mergedByAttempt.reduce((previous, current) => this.mergeAsRetry(previous, current));

            // Write merged result back for self-healing (test-runs/{runId}/db.json)
            const outputPath = Path.from('test-runs').join(Path.from(runId)).join(Path.from('db.json'));
            this.fileSystem.ensureDirectoryExistsAtSync(Path.from('test-runs').join(Path.from(runId)));
            this.fileSystem.storeSync(outputPath, JSON.stringify(finalRun, undefined, 2), 'utf8');

            mergedRuns.push(finalRun);
        }

        return mergedRuns.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    }

    private mergeAdditively(base: RunData, addition: RunData): RunData {
        const merged: RunData = { ...base };
        merged.scenes = [...base.scenes, ...addition.scenes];
        merged.outcomes = {
            passed: base.outcomes.passed + addition.outcomes.passed,
            failed: base.outcomes.failed + addition.outcomes.failed,
            pending: base.outcomes.pending + addition.outcomes.pending,
            skipped: base.outcomes.skipped + addition.outcomes.skipped,
            compromised: base.outcomes.compromised + addition.outcomes.compromised,
            error: base.outcomes.error + addition.outcomes.error,
        };
        if (addition.startedAt < merged.startedAt) merged.startedAt = addition.startedAt;
        if (addition.finishedAt > merged.finishedAt) merged.finishedAt = addition.finishedAt;
        merged.tags = [...base.tags];
        for (const tag of (addition.tags || [])) {
            if (!merged.tags.some(t => t.type === tag.type && t.name === tag.name)) {
                merged.tags.push(tag);
            }
        }
        return merged;
    }

    private mergeAsRetry(earlier: RunData, later: RunData): RunData {
        const merged: RunData = { ...later };
        const earlierScenes = new Map<string, typeof earlier.scenes[0]>();
        for (const scene of earlier.scenes) {
            earlierScenes.set(this.sceneIdentity(scene), scene);
        }

        merged.scenes = later.scenes.map(laterScene => {
            const key = this.sceneIdentity(laterScene);
            const earlierScene = earlierScenes.get(key);
            if (!earlierScene) {
                return laterScene; // new in retry — keep as-is
            }
            // Promote earlier result into attempts[]
            const existingAttempts = earlierScene.attempts || [];
            const allAttempts = [
                ...existingAttempts,
                {
                    attemptNumber: existingAttempts.length + 1,
                    outcome: earlierScene.outcome,
                    duration: earlierScene.duration,
                    activities: earlierScene.activities,
                    ...(earlierScene.error ? { error: earlierScene.error } : {}),
                },
                {
                    attemptNumber: existingAttempts.length + 2,
                    outcome: laterScene.outcome,
                    duration: laterScene.duration,
                    activities: laterScene.activities,
                    ...(laterScene.error ? { error: laterScene.error } : {}),
                },
            ];
            return {
                name: laterScene.name,
                category: laterScene.category,
                outcome: laterScene.outcome,
                duration: laterScene.duration,
                startedAt: laterScene.startedAt,
                source: laterScene.source,
                tags: laterScene.tags,
                activities: laterScene.activities,
                ...(laterScene.error ? { error: laterScene.error } : {}),
                ...(laterScene.video ? { video: laterScene.video } : {}),
                ...(laterScene.cast ? { cast: laterScene.cast } : {}),
                ...(laterScene.narrative ? { narrative: laterScene.narrative } : {}),
                ...(laterScene.description ? { description: laterScene.description } : {}),
                ...(laterScene.artifacts ? { artifacts: laterScene.artifacts } : {}),
                attempts: allAttempts,
                retries: allAttempts.length - 1,
            } as SceneRecord;
        });

        // Include scenes from earlier attempt that weren't retried
        const laterSceneKeys = new Set(later.scenes.map(s => this.sceneIdentity(s)));
        for (const earlierScene of earlier.scenes) {
            if (!laterSceneKeys.has(this.sceneIdentity(earlierScene))) {
                merged.scenes.push(earlierScene);
            }
        }

        // Recompute outcomes from the final merged scenes
        merged.outcomes = { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 };
        for (const scene of merged.scenes) {
            const key = this.mapOutcomeToKey(outcomeCodeToDisplayString(scene.outcome.code));
            merged.outcomes[key as keyof typeof merged.outcomes]++;
        }

        if (earlier.startedAt < merged.startedAt) merged.startedAt = earlier.startedAt;

        return merged;
    }

    private sceneIdentity(scene: { source: { path: string; line: number }; name: string }): string {
        return scene.source.line
            ? `${ scene.source.path }:${ scene.source.line }`
            : `${ scene.source.path }:${ scene.name }`;
    }

    private copyArtifactsFromSource(databaseJsonPath: string, runId: string, subDirectory: string): void {
        const sourceFs = this.sourceFileSystem;
        if (!sourceFs) {
            return;
        }

        const sourceDirectory = Path.from(databaseJsonPath.replace(/\/db\.json$/, ''));
        const targetDirectory = subDirectory === '.'
            ? Path.from('test-runs').join(Path.from(runId))
            : Path.from('test-runs').join(Path.from(runId)).join(Path.from(subDirectory));

        this.fileSystem.ensureDirectoryExistsAtSync(targetDirectory);

        const entries = sourceFs.readdirSync(sourceDirectory);
        for (const entry of entries) {
            if (entry === 'db.json') {
                continue; // merged db.json is written separately at the build-level path
            }
            const targetPath = targetDirectory.join(Path.from(entry));
            if (this.fileSystem.exists(targetPath)) {
                continue;
            }
            const sourcePath = sourceDirectory.join(Path.from(entry));
            const data = sourceFs.readFileSync(sourcePath);
            this.fileSystem.storeSync(targetPath, data, undefined);
        }
    }

    private computeDegradedRecovered(allRuns: RunData[]): { newFailures: Array<{ name: string; category: string; source: { path: string; line: number } }>; newPasses: Array<{ name: string; category: string; source: { path: string; line: number } }> } {
        const newFailures: Array<{ name: string; category: string; source: { path: string; line: number } }> = [];
        const newPasses: Array<{ name: string; category: string; source: { path: string; line: number } }> = [];

        if (allRuns.length < 2) {
            return { newFailures, newPasses };
        }

        const latestRun = allRuns[allRuns.length - 1];
        const previousRun = allRuns[allRuns.length - 2];
        const previousOutcomes = new Map(previousRun.scenes.map(s => [s.source.path + ':' + s.source.line, s.outcome.code]));

        for (const scene of latestRun.scenes) {
            const key = scene.source.path + ':' + scene.source.line;
            const previousCode = previousOutcomes.get(key);
            if (previousCode !== undefined) {
                const previousSuccess = previousCode === ExecutionSuccessful.Code;
                const currentSuccess = scene.outcome.code === ExecutionSuccessful.Code;
                if (previousSuccess && !currentSuccess) {
                    newFailures.push({ name: scene.name, category: scene.category, source: scene.source });
                } else if (!previousSuccess && currentSuccess) {
                    newPasses.push({ name: scene.name, category: scene.category, source: scene.source });
                }
            }
        }

        return { newFailures, newPasses };
    }

    private buildSummary(latestRun: RunData): { title: string; totalScenarios: number; outcomes: typeof latestRun.outcomes; duration: number; startedAt: string; finishedAt: string; testRunner: string } {
        const duration = new Date(latestRun.finishedAt).getTime() - new Date(latestRun.startedAt).getTime();

        return {
            title: this.config.title || latestRun.testRunner.name,
            totalScenarios: latestRun.scenes.length,
            outcomes: latestRun.outcomes,
            duration,
            startedAt: latestRun.startedAt,
            finishedAt: latestRun.finishedAt,
            testRunner: latestRun.testRunner.name,
        };
    }

    private enrichScenarios(latestRun: RunData, allRuns: RunData[]): ReportScenario[] {
        return latestRun.scenes.map(scene => {
            const key = scene.source.line
                ? scene.source.path + ':' + scene.source.line
                : scene.source.path + ':' + scene.name;
            const executionHistory = allRuns.map(run => {
                const match = run.scenes.find(s => {
                    const matchKey = s.source.line
                        ? s.source.path + ':' + s.source.line
                        : s.source.path + ':' + s.name;
                    return matchKey === key;
                });
                if (!match) return undefined;
                const entry: ReportExecutionHistoryEntry = {
                    outcome: outcomeCodeToDisplayString(match.outcome.code),
                    run: this.resolveRunLabel(run),
                    timestamp: run.startedAt,
                    duration: match.duration,
                    activities: match.activities.map(activity => this.mapActivityOutcome(activity)),
                };
                if (match.error) {
                    entry.error = match.error;
                }
                if (match.attempts && match.retries) {
                    entry.retries = match.retries;
                    entry.attempts = match.attempts.map(attempt => ({
                        ...attempt,
                        outcome: outcomeCodeToDisplayString(attempt.outcome.code),
                        activities: attempt.activities.map(activity => this.mapActivityOutcome(activity)),
                    }));
                }
                return entry;
            }).filter(Boolean) as ReportExecutionHistoryEntry[];

            const enriched: ReportScenario = {
                name: scene.name,
                category: scene.category,
                outcome: outcomeCodeToDisplayString(scene.outcome.code),
                duration: scene.duration,
                startedAt: scene.startedAt,
                source: scene.source,
                tags: [...new Map(scene.tags.map(t => [t.type + ':' + t.name, t])).values()],
                activities: scene.activities.map(activity => this.mapActivityOutcome(activity)),
                executionHistory,
            };

            if (scene.narrative) {
                enriched.narrative = marked.parse(scene.narrative, { async: false }) as string;
            }
            if (scene.description) {
                enriched.description = marked.parse(scene.description, { async: false }) as string;
            }
            if (scene.error) {
                enriched.error = scene.error;
            }
            if (scene.cast) {
                enriched.cast = scene.cast;
            }
            if (scene.video) {
                enriched.video = scene.video;
            }
            if (scene.scenarioOutline) {
                enriched.scenarioOutline = {
                    template: scene.scenarioOutline.template,
                    parameters: scene.scenarioOutline.parameters.map(ps => ({
                        ...ps,
                        ...(ps.description ? { description: marked.parse(ps.description, { async: false }) as string } : {}),
                        outcome: outcomeCodeToDisplayString(ps.outcome.code),
                        activities: ps.activities.map(activity => this.mapActivityOutcome(activity)),
                    })),
                };
            }
            if (scene.attempts) {
                enriched.retries = scene.retries;
                enriched.attempts = scene.attempts.map(attempt => ({
                    ...attempt,
                    outcome: outcomeCodeToDisplayString(attempt.outcome.code),
                    activities: attempt.activities.map(activity => this.mapActivityOutcome(activity)),
                }));
            }

            return enriched;
        });
    }

    private buildHistory(allRuns: RunData[]): ReportHistoryEntry[] {
        return allRuns.map((run, index) => {
            const durations = run.scenes.map(s => s.duration).filter(d => d > 0);
            const ci = run.systemContext?.runtime;

            // Compute score for this run
            const total = Object.values(run.outcomes).reduce((a: number, b: number) => a + b, 0);
            const passed = run.outcomes.passed || 0;
            const pending = (run.outcomes.pending || 0) + (run.outcomes.skipped || 0);
            const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
            const completeness = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;

            // Consistency: proportion of tests with consistent outcomes up to this run
            const runsUpToHere = allRuns.slice(0, index + 1);
            const consistency = this.computeConsistencyAtRun(runsUpToHere);
            const confidence = Math.round(completeness * 0.3 + passRate * 0.35 + consistency * 0.35);

            return {
                timestamp: run.startedAt,
                duration: new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime(),
                outcomes: run.outcomes,
                label: this.resolveRunLabel(run),
                slowest: durations.length > 0 ? Math.max(...durations) : 0,
                fastest: durations.length > 0 ? Math.min(...durations) : 0,
                average: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
                ...(ci?.commit ? { commit: ci.commit } : {}),
                ...(ci?.branch ? { branch: ci.branch } : {}),
                ...(ci?.jobUrl ? { ciJobUrl: ci.jobUrl } : {}),
                ...(ci?.repositoryUrl ? { repositoryUrl: ci.repositoryUrl } : {}),
                score: { confidence, passRate, consistency, completeness },
            };
        });
    }

    private computeConsistencyAtRun(runs: RunData[]): number {
        if (runs.length < 2) return 100;
        const testOutcomes = new Map<string, string[]>();
        for (const run of runs) {
            for (const scene of run.scenes) {
                const identity = `${ scene.name }@${ scene.source.path }`;
                if (!testOutcomes.has(identity)) testOutcomes.set(identity, []);
                testOutcomes.get(identity).push(outcomeCodeToDisplayString(scene.outcome.code));
            }
        }
        let totalTests = 0;
        let stableTests = 0;
        for (const [, outcomes] of testOutcomes) {
            if (outcomes.length >= 2) {
                totalTests++;
                if (new Set(outcomes).size === 1) stableTests++;
            }
        }
        return totalTests > 0 ? Math.round((stableTests / totalTests) * 100) : 100;
    }

    private buildSystemContext(latestRun: RunData): ReportSystemContext | undefined {
        if (!latestRun.systemContext) {
            return undefined;
        }
        return {
            nodeVersion: latestRun.systemContext.nodeVersion,
            os: latestRun.systemContext.os,
            serenityVersion: String(latestRun.systemContext.serenityVersion),
            testRunner: latestRun.testRunner,
            browsers: this.extractBrowsers(latestRun),
            ci: latestRun.systemContext.runtime,
            projectName: latestRun.systemContext.projectName,
            packageManager: latestRun.systemContext.packageManager,
            environmentUnderTest: latestRun.systemContext.environmentUnderTest,
        };
    }

    private extractBrowsers(run: RunData): Array<{ name: string; version: string }> {
        const browsers = new Map<string, string>();
        for (const scene of run.scenes) {
            for (const tag of scene.tags) {
                if (tag.type === 'browser') {
                    const parts = tag.name.split(' ');
                    const name = parts[0] || tag.name;
                    const version = parts.slice(1).join(' ') || '';
                    if (!browsers.has(name)) {
                        browsers.set(name, version);
                    }
                }
            }
        }
        return [...browsers.entries()].map(([name, version]) => ({ name, version }));
    }

    private buildCapabilities(run: RunData, allRuns: RunData[]): ReportCapabilityNode {
        const rootName = this.requirementsHierarchy.rootDirectory().basename();
        const root: ReportCapabilityNode = { type: 'directory', name: rootName, outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarioCount: 0, children: [] };
        const nodeMap = new Map<string, ReportCapabilityNode>();
        nodeMap.set('', root);

        for (const scene of run.scenes) {
            const segments = this.requirementsHierarchy.hierarchyFor(Path.from(scene.source.path));
            const fileName = segments[segments.length - 1];
            const directories = segments.slice(0, -1);

            let currentDirectory = root;
            for (let i = 0; i < directories.length; i++) {
                const directoryKey = directories.slice(0, i + 1).join('/');
                if (!nodeMap.has(directoryKey)) {
                    const directory: ReportCapabilityNode = { type: 'directory', name: directories[i], outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarioCount: 0, children: [] };
                    currentDirectory.children.push(directory);
                    nodeMap.set(directoryKey, directory);
                }
                currentDirectory = nodeMap.get(directoryKey);
            }

            const fileKey = segments.join('/');
            if (!nodeMap.has(fileKey)) {
                const file: ReportCapabilityNode = { type: 'file', name: fileName, outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarioCount: 0, scenarios: [] };
                currentDirectory.children.push(file);
                nodeMap.set(fileKey, file);
            }

            const fileNode = nodeMap.get(fileKey);
            const outcomeKey = this.mapOutcomeToKey(outcomeCodeToDisplayString(scene.outcome.code)) as keyof ReportOutcomes;

            fileNode.scenarioCount++;
            fileNode.outcomes[outcomeKey]++;

            // Build execution history for this scenario across all runs
            const scenarioKey = scene.source.path + ':' + scene.source.line;
            const executionHistory = allRuns.map(r => {
                const match = r.scenes.find(s => s.source.path + ':' + s.source.line === scenarioKey);
                return match ? outcomeCodeToDisplayString(match.outcome.code) : undefined;
            }).filter(Boolean) as string[];

            fileNode.scenarios.push({ name: scene.name, outcome: outcomeCodeToDisplayString(scene.outcome.code), executionHistory });
            if (scene.narrative && !fileNode.narrative) {
                fileNode.narrative = scene.narrative;
            }

            root.scenarioCount++;
            root.outcomes[outcomeKey]++;
            for (let i = 0; i < directories.length; i++) {
                const directoryNode = nodeMap.get(directories.slice(0, i + 1).join('/'));
                if (directoryNode && directoryNode !== root) {
                    directoryNode.scenarioCount++;
                    directoryNode.outcomes[outcomeKey]++;
                }
            }
        }

        // Compute scores for file nodes
        for (const [, node] of nodeMap) {
            if (node.type === 'file' && node.scenarios) {
                node.score = scoreCapability(node as ReportCapabilityNode & { scenarios: NonNullable<ReportCapabilityNode['scenarios']> });
            }
        }

        // Compute scores for directory nodes (bottom-up)
        this.computeDirectoryScores(root);

        if (this.projectFileSystem) {
            const specRoot = this.requirementsHierarchy.rootDirectory();
            this.attachReadme(root, specRoot);
            for (const [key, node] of nodeMap) {
                if (key && node.type === 'directory') {
                    this.attachReadme(node, specRoot.join(Path.from(key)));
                }
            }
        }

        return root;
    }

    private computeDirectoryScores(node: ReportCapabilityNode): void {
        if (!node.children) return;

        for (const child of node.children) {
            if (child.type === 'directory') {
                this.computeDirectoryScores(child);
            }
        }

        const scoredChildren = node.children
            .filter(c => c.score)
            .map(c => ({ confidence: c.score.confidence, scenarioCount: c.scenarioCount || 0 }));

        if (scoredChildren.length > 0) {
            const confidence = scoreDirectory(scoredChildren);
            node.score = { confidence, passRate: 0, completeness: 0, consistency: 0 };

            // Also compute pass rate/completeness/consistency for the directory directly
            const total = Object.values(node.outcomes).reduce((a: number, b: number) => a + b, 0) as number;
            const pending = ((node.outcomes.pending || 0) + (node.outcomes.skipped || 0)) as number;
            const executed = total - pending;
            node.score.passRate = executed > 0 ? Math.round((node.outcomes.passed / executed) * 100) : 0;
            node.score.completeness = total > 0 ? Math.round(((total - pending) / total) * 100) : 0;
            node.score.consistency = 100; // Would need aggregated history; use child-weighted confidence instead
        }
    }

    private attachReadme(node: ReportCapabilityNode, directoryPath: Path): void {
        const readmePath = directoryPath.join(Path.from('readme.md'));
        if (this.projectFileSystem.exists(readmePath)) {
            const content = this.projectFileSystem.readFileSync(readmePath, { encoding: 'utf8' }) as string;

            // Extract first heading as displayName
            const headingMatch = content.match(/^#{1,2}\s+(.+)$/m);
            if (headingMatch) {
                node.displayName = headingMatch[1].trim();
            }

            // Render markdown and strip the first heading to avoid duplication
            let html = marked.parse(content, { async: false }) as string;
            if (node.displayName) {
                html = html.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/i, '');
            }
            node.readme = html;
        }
    }

    private computeTagStats(run: RunData): Array<{ type: string; name: string; scenarioCount: number; passed: number }> {
        const tagMap = new Map<string, { type: string; name: string; scenarioCount: number; passed: number }>();
        for (const scene of run.scenes) {
            for (const tag of scene.tags) {
                const key = tag.type + ':' + tag.name;
                if (!tagMap.has(key)) {
                    tagMap.set(key, { type: tag.type, name: tag.name, scenarioCount: 0, passed: 0 });
                }
                const entry = tagMap.get(key);
                entry.scenarioCount++;
                if (scene.outcome.code === ExecutionSuccessful.Code) {
                    entry.passed++;
                }
            }
        }
        return [...tagMap.values()];
    }

    private mapOutcomeToKey(outcome: string): string {
        switch (outcome) {
            case 'SUCCESS': return 'passed';
            case 'FAILURE': return 'failed';
            case 'ERROR': return 'error';
            case 'COMPROMISED': return 'compromised';
            case 'PENDING': return 'pending';
            case 'SKIPPED': return 'skipped';
            default: return 'error';
        }
    }

    private findRunDirectories(): Path[] {
        const testRunsDirectory = Path.from('test-runs');

        if (!this.fileSystem.exists(testRunsDirectory)) {
            return [];
        }

        const entries = this.fileSystem.readdirSync(testRunsDirectory);
        return entries
            .filter(entry => this.fileSystem.exists(testRunsDirectory.join(Path.from(entry)).join(Path.from('db.json'))))
            .sort()
            .map(entry => testRunsDirectory.join(Path.from(entry)));
    }

    private identifyUnstableTests(allRuns: RunData[]): Array<{ name: string; category: string; source: { path: string; line: number }; inconsistencyRate: number; history: string[]; labels: string[] }> {
        const recentRuns = allRuns.slice(-this.config.consistencyWindow);

        // Collect outcomes per test identity (name@path)
        const testOutcomes = new Map<string, { name: string; category: string; source: { path: string; line: number }; outcomes: string[]; labels: string[] }>();

        for (const run of recentRuns) {
            const runLabel = this.resolveRunLabel(run);
            for (const scene of run.scenes) {
                const identity = `${ scene.name }@${ scene.source.path }`;
                if (!testOutcomes.has(identity)) {
                    testOutcomes.set(identity, { name: scene.name, category: scene.category, source: scene.source, outcomes: [], labels: [] });
                }
                const entry = testOutcomes.get(identity);
                entry.outcomes.push(outcomeCodeToDisplayString(scene.outcome.code));
                entry.labels.push(runLabel);
            }
        }

        // Find tests with mixed outcomes
        const unstable: Array<{ name: string; category: string; source: { path: string; line: number }; inconsistencyRate: number; history: string[]; labels: string[] }> = [];

        for (const [, test] of testOutcomes) {
            const uniqueOutcomes = new Set(test.outcomes);
            if (uniqueOutcomes.size > 1) {
                const failures = test.outcomes.filter(o => o !== 'SUCCESS').length;
                unstable.push({
                    name: test.name,
                    category: test.category,
                    source: test.source,
                    inconsistencyRate: failures / test.outcomes.length,
                    history: test.outcomes,
                    labels: test.labels,
                });
            }
        }

        return unstable.sort((a, b) => b.inconsistencyRate - a.inconsistencyRate);
    }

    private mapActivityOutcome(activity: ActivityRecord): ReportActivity {
        const mapped: ReportActivity = {
            name: activity.name,
            outcome: outcomeCodeToDisplayString(activity.outcome.code),
            duration: activity.duration,
            children: activity.children.map(child => this.mapActivityOutcome(child)),
        };

        if (activity.type) mapped.type = activity.type;
        if (activity.startedAt) mapped.startedAt = activity.startedAt;
        if (activity.location) mapped.location = activity.location;
        if (activity.error) mapped.error = activity.error;
        if (activity.artifacts) mapped.artifacts = activity.artifacts;
        if (activity.restQuery) mapped.restQuery = activity.restQuery;
        if (activity.reportData) mapped.reportData = activity.reportData;

        return mapped;
    }

    private resolveRunLabel(run: RunData): string {
        return run.testRunId || run.startedAt;
    }
}

function outcomeCodeToDisplayString(code: number): string {
    if (code === ExecutionSuccessful.Code) return 'SUCCESS';
    if (code === ExecutionFailedWithAssertionError.Code) return 'FAILURE';
    if (code === ExecutionFailedWithError.Code) return 'ERROR';
    if (code === ExecutionCompromised.Code) return 'COMPROMISED';
    if (code === ImplementationPending.Code) return 'PENDING';
    if (code === ExecutionSkipped.Code) return 'SKIPPED';
    return 'ERROR';
}
