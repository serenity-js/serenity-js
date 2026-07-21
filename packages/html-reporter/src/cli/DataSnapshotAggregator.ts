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

import { buildCapabilities } from './capabilities/buildCapabilities.js';
import { buildHistory } from './history/buildHistory.js';
import type { ActivityRecord, AttemptRecord, OutcomeCounts, RunData, SceneRecord, TagRecord } from './model/RunData.js';
import { sceneIdentity, sceneIdentityWithTags } from './model/sceneIdentity.js';
import { IncompatibleSchemaError, InvalidRunDataError, validateRunData } from './model/validation.js';
import type { ReportActivity, ReportData, ReportExecutionHistoryEntry, ReportScenario, ReportSystemContext } from './ReportData.js';
import { CURRENT_REPORT_DATA_SCHEMA_VERSION } from './ReportData.js';
import { SummaryJsonWriter } from './SummaryJsonWriter.js';

interface AggregatorConfig {
    consistencyWindow: number;
    maxHistory?: number;
    title?: string;
    buildCapabilities?: boolean;
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
        private readonly requirementsHierarchy: RequirementsHierarchy,
        private readonly projectFileSystem: FileSystem,
        private readonly sourceFileSystem: FileSystem,
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
            history: buildHistory(allRuns),
            tags: this.computeTagStats(latestRun),
            inconsistentTests: this.identifyUnstableTests(allRuns),
            newFailures,
            newPasses,
            systemContext: this.buildSystemContext(latestRun),
            capabilities: this.config.buildCapabilities ? buildCapabilities(latestRun, allRuns, this.requirementsHierarchy, this.projectFileSystem) : undefined,
            specDirectory: this.resolveSpecDirectoryForClient(),
        };

        const js = `window.__SERENITY_REPORT_DATA__ = ${ JSON.stringify(snapshot, undefined, 2) };\n`;
        this.fileSystem.storeSync(Path.from('data.js'), js, 'utf8');

        const specDirectoryPath = (() => { try { return this.requirementsHierarchy.rootDirectory().value; } catch { return undefined; } })();
        new SummaryJsonWriter(this.fileSystem).write(snapshot, specDirectoryPath);
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

    private safeParseRunData(content: string, path: string): RunData | null {
        try {
            const raw = JSON.parse(content);
            return validateRunData(raw, path);
        } catch (error) {
            if (error instanceof InvalidRunDataError || error instanceof IncompatibleSchemaError || error instanceof SyntaxError) {
                console.warn(`[html-reporter] Skipping ${ path }: ${ (error as Error).message }`);
                return null;
            }
            throw error;
        }
    }

    private loadRuns(runDirectories: Path[]): RunData[] {
        const runs: RunData[] = [];

        for (const directory of runDirectories) {
            const databaseJsonPath = directory.join(Path.from('db.json'));
            const content = this.fileSystem.readFileSync(databaseJsonPath, { encoding: 'utf8' }) as string;
            const run = this.safeParseRunData(content, databaseJsonPath.value);
            if (run) {
                runs.push(run);
            }
        }

        return runs;
    }

    private loadExternalRuns(paths: string[]): RunData[] {
        const validRuns = this.loadAndValidateRuns(paths);
        const groups = this.groupByTestRunId(validRuns);
        const merged = this.mergeRunGroups(groups);
        this.persistMergedRuns(merged);
        return [...merged.values()].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    }

    private loadAndValidateRuns(paths: string[]): Array<{ run: RunData; path: string }> {
        const results: Array<{ run: RunData; path: string }> = [];

        for (const databaseJsonPath of paths) {
            const content = this.sourceFileSystem.readFileSync(Path.from(databaseJsonPath), { encoding: 'utf8' }) as string;
            const run = this.safeParseRunData(content, databaseJsonPath);
            if (!run) continue;
            results.push({ run, path: databaseJsonPath });

            // Copy sibling artifacts before any merging
            const pathWithoutDatabase = databaseJsonPath.replace(/\/db\.json$/, '');
            const testRunsIndex = pathWithoutDatabase.lastIndexOf('/test-runs/');
            if (testRunsIndex !== -1) {
                const relative = pathWithoutDatabase.slice(testRunsIndex + '/test-runs/'.length);
                const slashIndex = relative.indexOf('/');
                if (slashIndex !== -1) {
                    this.copyArtifactsFromSource(databaseJsonPath, relative.slice(0, slashIndex), relative.slice(slashIndex + 1));
                } else {
                    this.copyArtifactsFromSource(databaseJsonPath, relative, '.');
                }
            }
        }

        return results;
    }

    private groupByTestRunId(runs: Array<{ run: RunData; path: string }>): Map<string, RunData[]> {
        const groups = new Map<string, RunData[]>();
        for (const { run } of runs) {
            const groupId = run.testRunId || run.startedAt.replaceAll(':', '-');
            if (!groups.has(groupId)) groups.set(groupId, []);
            groups.get(groupId)!.push(run);
        }
        return groups;
    }

    private mergeRunGroups(groups: Map<string, RunData[]>): Map<string, RunData> {
        const merged = new Map<string, RunData>();

        for (const [runId, runsInGroup] of groups) {
            // Sub-group by attempt number (missing attempt defaults to 1)
            const byAttempt = new Map<number, RunData[]>();
            for (const run of runsInGroup) {
                const attempt = run.attempt ?? 1;
                if (!byAttempt.has(attempt)) byAttempt.set(attempt, []);
                byAttempt.get(attempt)!.push(run);
            }

            // Additive merge within each attempt
            const attemptNumbers = [...byAttempt.keys()].sort((a, b) => a - b);
            const mergedByAttempt: RunData[] = attemptNumbers.map(attemptNumber => {
                const runsForAttempt = byAttempt.get(attemptNumber)!;
                return runsForAttempt.reduce((base, run) => this.mergeAdditively(base, run));
            });

            // Retry merge across attempts (in order)
            const finalRun = mergedByAttempt.reduce((previous, current) => this.mergeAsRetry(previous, current));
            merged.set(runId, finalRun);
        }

        return merged;
    }

    private persistMergedRuns(merged: Map<string, RunData>): void {
        for (const [runId, finalRun] of merged) {
            const outputPath = Path.from('test-runs').join(Path.from(runId)).join(Path.from('db.json'));
            this.fileSystem.ensureDirectoryExistsAtSync(Path.from('test-runs').join(Path.from(runId)));
            this.fileSystem.storeSync(outputPath, JSON.stringify(finalRun, undefined, 2), 'utf8');
        }
    }

    private mergeAdditively(base: RunData, addition: RunData): RunData {
        const merged: RunData = { ...base };

        // Build a map of base scenes by identity to detect overlaps
        const baseScenesByIdentity = new Map<string, SceneRecord>();
        for (const scene of base.scenes) {
            baseScenesByIdentity.set(this.sceneIdentity(scene), scene);
        }

        // Merge scenes: new scenes are added, overlapping scenes are handled
        merged.scenes = [...base.scenes];
        let hasOverlap = false;
        for (const additionScene of addition.scenes) {
            const key = this.sceneIdentity(additionScene);
            const existingScene = baseScenesByIdentity.get(key);

            if (!existingScene) {
                // No overlap — different module, just add it
                merged.scenes.push(additionScene);
            } else if (existingScene.outcome.code !== additionScene.outcome.code) {
                // Same scene, different outcome — the earlier source captured a failure
                // that the later source shows as fixed. Record as retry attempt.
                const index = merged.scenes.indexOf(existingScene);
                merged.scenes[index] = this.mergeSceneWithRetry(existingScene, additionScene);
                hasOverlap = true;
            } else {
                // Same scene, same outcome — duplicate data from two input sources
                // (e.g., gh-pages pre-merged run + fresh module artifacts).
                // Keep the later version (may have more complete data) and skip the duplicate.
                const index = merged.scenes.indexOf(existingScene);
                merged.scenes[index] = additionScene;
                hasOverlap = true;
            }
        }

        // Recompute outcomes from merged scenes when overlaps were detected;
        // otherwise sum the declared outcome counts (supports modules with scenes: [])
        if (hasOverlap) {
            merged.outcomes = this.computeMergedOutcomes(merged.scenes);
        } else {
            merged.outcomes = {
                passed: base.outcomes.passed + addition.outcomes.passed,
                failed: base.outcomes.failed + addition.outcomes.failed,
                pending: base.outcomes.pending + addition.outcomes.pending,
                skipped: base.outcomes.skipped + addition.outcomes.skipped,
                compromised: base.outcomes.compromised + addition.outcomes.compromised,
                error: base.outcomes.error + addition.outcomes.error,
            };
        }

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
                return laterScene;
            }

            // Only create retry attempts when the earlier scene actually failed.
            // If the earlier scene already passed, the CI retry didn't change anything
            // for this test — it's not a genuine retry, just a re-execution.
            const earlierFailed = earlierScene.outcome.code !== ExecutionSuccessful.Code;
            const earlierHadRetries = earlierScene.retries > 0;
            if (!earlierFailed && !earlierHadRetries) {
                return laterScene;
            }

            return this.mergeSceneWithRetry(earlierScene, laterScene);
        });

        // Include scenes from earlier attempt that weren't retried
        const laterSceneKeys = new Set(later.scenes.map(s => this.sceneIdentity(s)));
        for (const earlierScene of earlier.scenes) {
            if (!laterSceneKeys.has(this.sceneIdentity(earlierScene))) {
                merged.scenes.push(earlierScene);
            }
        }

        // Recompute outcomes from the final merged scenes
        merged.outcomes = this.computeMergedOutcomes(merged.scenes);
        if (earlier.startedAt < merged.startedAt) merged.startedAt = earlier.startedAt;

        return merged;
    }

    private mergeSceneWithRetry(earlierScene: SceneRecord, laterScene: SceneRecord): SceneRecord {
        const existingAttempts = earlierScene.attempts || [];
        const allAttempts = [
            ...existingAttempts,
            this.sceneToAttempt(earlierScene, existingAttempts.length + 1),
            this.sceneToAttempt(laterScene, existingAttempts.length + 2),
        ];
        return {
            ...laterScene,
            attempts: allAttempts,
            retries: allAttempts.length - 1,
        } as SceneRecord;
    }

    private sceneToAttempt(scene: SceneRecord, attemptNumber: number): AttemptRecord {
        return {
            attemptNumber,
            outcome: scene.outcome,
            duration: scene.duration,
            activities: scene.activities,
            ...(scene.error ? { error: scene.error } : {}),
            ...(scene.video ? { video: scene.video } : {}),
        };
    }

    private computeMergedOutcomes(scenes: SceneRecord[]): OutcomeCounts {
        const outcomes: OutcomeCounts = { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 };
        for (const scene of scenes) {
            const key = this.mapOutcomeToKey(outcomeCodeToDisplayString(scene.outcome.code));
            outcomes[key as keyof OutcomeCounts]++;
        }
        return outcomes;
    }

    private sceneIdentity(scene: { source: { path: string; line: number }; name: string }): string {
        return sceneIdentity(scene);
    }

    private sceneIdentityWithBrowser(scene: { source: { path: string; line: number }; name: string; tags: TagRecord[] }): string {
        return sceneIdentityWithTags(scene);
    }

    private copyArtifactsFromSource(databaseJsonPath: string, runId: string, subDirectory: string): void {
        const safeRunId = runId.replaceAll(':', '-');
        const sourceDirectory = Path.from(databaseJsonPath.replace(/\/db\.json$/, ''));
        const targetDirectory = subDirectory === '.'
            ? Path.from('test-runs').join(Path.from(safeRunId))
            : Path.from('test-runs').join(Path.from(safeRunId)).join(Path.from(subDirectory));

        this.fileSystem.ensureDirectoryExistsAtSync(targetDirectory);

        const entries = this.sourceFileSystem.readdirSync(sourceDirectory);
        for (const entry of entries) {
            if (entry === 'db.json') {
                continue; // merged db.json is written separately at the build-level path
            }
            const targetPath = targetDirectory.join(Path.from(entry));
            if (this.fileSystem.exists(targetPath)) {
                continue;
            }
            const sourcePath = sourceDirectory.join(Path.from(entry));
            const data = this.sourceFileSystem.readFileSync(sourcePath);
            this.fileSystem.storeSync(targetPath, data, undefined);
        }
    }

    private computeDegradedRecovered(allRuns: RunData[]): { newFailures: Array<{ name: string; category: string; source: { path: string; line: number }; tags?: TagRecord[] }>; newPasses: Array<{ name: string; category: string; source: { path: string; line: number }; tags?: TagRecord[] }> } {
        const newFailures: Array<{ name: string; category: string; source: { path: string; line: number }; tags?: TagRecord[] }> = [];
        const newPasses: Array<{ name: string; category: string; source: { path: string; line: number }; tags?: TagRecord[] }> = [];

        if (allRuns.length < 2) {
            return { newFailures, newPasses };
        }

        const latestRun = allRuns[allRuns.length - 1];
        const previousRun = allRuns[allRuns.length - 2];
        const previousOutcomes = new Map(previousRun.scenes.map(s => [this.sceneIdentityWithBrowser(s), s.outcome.code]));

        for (const scene of latestRun.scenes) {
            const key = this.sceneIdentityWithBrowser(scene);
            const previousCode = previousOutcomes.get(key);
            if (previousCode !== undefined) {
                const previousSuccess = previousCode === ExecutionSuccessful.Code;
                const currentSuccess = scene.outcome.code === ExecutionSuccessful.Code;
                const currentRetried = scene.retries > 0 && currentSuccess;
                if (previousSuccess && !currentSuccess) {
                    newFailures.push({ name: scene.name, category: scene.category, source: scene.source, tags: scene.tags });
                } else if (!previousSuccess && currentSuccess && !currentRetried) {
                    // Only count as "recovered" if it passed without retrying
                    newPasses.push({ name: scene.name, category: scene.category, source: scene.source, tags: scene.tags });
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
            const executionHistory = this.buildExecutionHistory(scene, allRuns);
            return this.enrichSingleScenario(scene, executionHistory);
        });
    }

    private buildExecutionHistory(scene: SceneRecord, allRuns: RunData[]): ReportExecutionHistoryEntry[] {
        const key = this.sceneIdentityWithBrowser(scene);
        return allRuns.map(run => {
            const match = run.scenes.find(s => this.sceneIdentityWithBrowser(s) === key);
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
            if (match.retries > 0 && match.outcome.code === ExecutionSuccessful.Code) {
                entry.retriedAndPassed = true;
            }
            return entry;
        }).filter(Boolean) as ReportExecutionHistoryEntry[];
    }

    private enrichSingleScenario(scene: SceneRecord, executionHistory: ReportExecutionHistoryEntry[]): ReportScenario {
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
                if (tag.type !== 'browser') continue;

                const parts = tag.name.split(' ');
                const name = parts[0] || tag.name;
                const version = parts.slice(1).join(' ') || '';
                if (!browsers.has(name)) {
                    browsers.set(name, version);
                }
            }
        }
        return [...browsers.entries()].map(([name, version]) => ({ name, version }));
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
        const map: Record<string, string> = { SUCCESS: 'passed', FAILURE: 'failed', ERROR: 'error', COMPROMISED: 'compromised', PENDING: 'pending', SKIPPED: 'skipped' };
        return map[outcome] || 'error';
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

    private identifyUnstableTests(allRuns: RunData[]): Array<{ name: string; category: string; source: { path: string; line: number }; tags: TagRecord[]; inconsistencyRate: number; history: string[]; labels: string[] }> {
        const recentRuns = allRuns.slice(-this.config.consistencyWindow);

        // Collect outcomes per test identity (name@path@project)
        // Including the project tag ensures different browser/OS variations are tracked separately
        const testOutcomes = new Map<string, { name: string; category: string; source: { path: string; line: number }; tags: TagRecord[]; outcomes: string[]; labels: string[] }>();

        for (const run of recentRuns) {
            const runLabel = this.resolveRunLabel(run);
            for (const scene of run.scenes) {
                const projectTag = scene.tags.find(t => t.type === 'project')?.name || '';
                const identity = `${ scene.name }@${ scene.source.path }@${ projectTag }`;
                if (!testOutcomes.has(identity)) {
                    testOutcomes.set(identity, { name: scene.name, category: scene.category, source: scene.source, tags: scene.tags, outcomes: [], labels: [] });
                }
                const entry = testOutcomes.get(identity);

                // A retried pass counts as a distinct outcome signal
                const effectiveOutcome = (scene.retries > 0 && scene.outcome.code === ExecutionSuccessful.Code)
                    ? 'RETRIED_SUCCESS'
                    : outcomeCodeToDisplayString(scene.outcome.code);
                entry.outcomes.push(effectiveOutcome);
                entry.labels.push(runLabel);
            }
        }

        // Find tests with mixed outcomes or any retried success
        const unstable: Array<{ name: string; category: string; source: { path: string; line: number }; tags: TagRecord[]; inconsistencyRate: number; history: string[]; labels: string[] }> = [];

        for (const [, test] of testOutcomes) {
            const uniqueOutcomes = new Set(test.outcomes);
            if (uniqueOutcomes.size > 1 || test.outcomes.includes('RETRIED_SUCCESS')) {
                const failures = test.outcomes.filter(o => o !== 'SUCCESS').length;
                unstable.push({
                    name: test.name,
                    category: test.category,
                    source: test.source,
                    tags: test.tags,
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

    /**
     * Derives the specDirectory marker for client-side path stripping.
     * Uses {@link RequirementsHierarchy} to resolve the root directory
     * (either from explicit config or via auto-detection), then returns
     * just the basename for use as a path marker in the browser.
     */
    private resolveSpecDirectoryForClient(): string | undefined {
        try {
            const root = this.requirementsHierarchy.rootDirectory();
            return root.basename();
        } catch {
            return undefined;
        }
    }
}

const OUTCOME_CODE_DISPLAY_STRINGS: Record<number, string> = {
    [ExecutionSuccessful.Code]: 'SUCCESS',
    [ExecutionFailedWithAssertionError.Code]: 'FAILURE',
    [ExecutionFailedWithError.Code]: 'ERROR',
    [ExecutionCompromised.Code]: 'COMPROMISED',
    [ImplementationPending.Code]: 'PENDING',
    [ExecutionSkipped.Code]: 'SKIPPED',
};

function outcomeCodeToDisplayString(code: number): string {
    return OUTCOME_CODE_DISPLAY_STRINGS[code] || 'ERROR';
}
