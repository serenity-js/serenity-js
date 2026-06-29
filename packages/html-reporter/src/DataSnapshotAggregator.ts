import { readFileSync } from 'node:fs';

import type { FileSystem } from '@serenity-js/core/io';
import type { RequirementsHierarchy } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';
import type { SerialisedOutcome } from '@serenity-js/core/model';
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
import type { RunData } from './model/RunData.js';

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
    ) {
    }

    aggregate(externalRunPaths?: string[]): void {
        const runDirectories = this.findRunDirectories();
        this.pruneOldRuns(runDirectories);

        const allRuns = externalRunPaths
            ? this.loadExternalRuns(externalRunPaths)
            : this.loadRuns(runDirectories);
        if (allRuns.length === 0) {
            return;
        }

        const latestRun = allRuns[allRuns.length - 1];
        const { newFailures, newPasses } = this.computeDegradedRecovered(allRuns);

        const snapshot = {
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
        return runDirectories.map(directory => {
            const databaseJsonPath = directory.join(Path.from('db.json'));
            const content = this.fileSystem.readFileSync(databaseJsonPath, { encoding: 'utf8' }) as string;
            return JSON.parse(content) as RunData;
        });
    }

    private loadExternalRuns(paths: string[]): RunData[] {
        const runsById = new Map<string, RunData>();

        for (const databaseJsonPath of paths) {
            const content = readFileSync(databaseJsonPath, 'utf8');
            const run = JSON.parse(content) as RunData;
            const directoryName = databaseJsonPath.replace(/\/db\.json$/, '').replace(/.*\//, '');

            const existing = runsById.get(directoryName);
            if (existing) {
                // Merge scenes and outcomes
                existing.scenes.push(...run.scenes);
                existing.outcomes.passed += run.outcomes.passed;
                existing.outcomes.failed += run.outcomes.failed;
                existing.outcomes.pending += run.outcomes.pending;
                existing.outcomes.skipped += run.outcomes.skipped;
                existing.outcomes.compromised += run.outcomes.compromised;
                existing.outcomes.error += run.outcomes.error;
                // Pick earliest startedAt and latest finishedAt
                if (run.startedAt < existing.startedAt) existing.startedAt = run.startedAt;
                if (run.finishedAt > existing.finishedAt) existing.finishedAt = run.finishedAt;
                // Merge tags
                for (const tag of (run.tags || [])) {
                    if (!existing.tags.some(t => t.type === tag.type && t.name === tag.name)) {
                        existing.tags.push(tag);
                    }
                }
            } else {
                runsById.set(directoryName, run);
            }
        }

        return [...runsById.values()].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
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

    private enrichScenarios(latestRun: RunData, allRuns: RunData[]): unknown[] {
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
                return match
                    ? {
                        outcome: outcomeCodeToDisplayString(match.outcome.code),
                        run: this.resolveRunLabel(run),
                        timestamp: run.startedAt,
                        activities: match.activities.map(activity => this.mapActivityOutcome(activity)),
                        ...(match.error ? { error: match.error } : {}),
                    }
                    : undefined;
            }).filter(Boolean);
            return {
                ...scene,
                tags: [...new Map(scene.tags.map(t => [t.type + ':' + t.name, t])).values()],
                outcome: outcomeCodeToDisplayString(scene.outcome.code),
                activities: scene.activities.map(activity => this.mapActivityOutcome(activity)),
                executionHistory,
                ...(scene.narrative ? { narrative: marked.parse(scene.narrative, { async: false }) as string } : {}),
                ...(scene.description ? { description: marked.parse(scene.description, { async: false }) as string } : {}),
                ...(scene.scenarioOutline ? {
                    scenarioOutline: {
                        template: scene.scenarioOutline.template,
                        parameters: scene.scenarioOutline.parameters.map(ps => ({
                            ...ps,
                            ...(ps.description ? { description: marked.parse(ps.description, { async: false }) as string } : {}),
                            outcome: outcomeCodeToDisplayString(ps.outcome.code),
                            activities: ps.activities.map(activity => this.mapActivityOutcome(activity)),
                        })),
                    },
                } : {}),
            };
        });
    }

    private buildHistory(allRuns: RunData[]): unknown[] {
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

    private buildSystemContext(latestRun: RunData): unknown {
        if (!latestRun.systemContext) {
            return undefined;
        }
        return {
            nodeVersion: latestRun.systemContext.nodeVersion,
            os: latestRun.systemContext.os,
            serenityVersion: latestRun.systemContext.serenityVersion,
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

    private buildCapabilities(run: RunData, allRuns: RunData[]): any {
        const rootName = this.requirementsHierarchy.rootDirectory().basename();
        const root: any = { type: 'directory', name: rootName, outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarioCount: 0, children: [] };
        const nodeMap = new Map<string, any>();
        nodeMap.set('', root);

        for (const scene of run.scenes) {
            const segments = this.requirementsHierarchy.hierarchyFor(Path.from(scene.source.path));
            const fileName = segments[segments.length - 1];
            const directories = segments.slice(0, -1);

            let currentDirectory = root;
            for (let i = 0; i < directories.length; i++) {
                const directoryKey = directories.slice(0, i + 1).join('/');
                if (!nodeMap.has(directoryKey)) {
                    const directory: any = { type: 'directory', name: directories[i], outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarioCount: 0, children: [] };
                    currentDirectory.children.push(directory);
                    nodeMap.set(directoryKey, directory);
                }
                currentDirectory = nodeMap.get(directoryKey);
            }

            const fileKey = segments.join('/');
            if (!nodeMap.has(fileKey)) {
                const file: any = { type: 'file', name: fileName, outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarioCount: 0, scenarios: [] };
                currentDirectory.children.push(file);
                nodeMap.set(fileKey, file);
            }

            const fileNode = nodeMap.get(fileKey);
            const outcomeKey = this.mapOutcomeToKey(outcomeCodeToDisplayString(scene.outcome.code));

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
                node.score = scoreCapability(node);
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

    private computeDirectoryScores(node: any): void {
        if (!node.children) return;

        for (const child of node.children) {
            if (child.type === 'directory') {
                this.computeDirectoryScores(child);
            }
        }

        const scoredChildren = node.children
            .filter((c: any) => c.score)
            .map((c: any) => ({ confidence: c.score.confidence, scenarioCount: c.scenarioCount || 0 }));

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

    private attachReadme(node: any, directoryPath: Path): void {
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

    private mapActivityOutcome(activity: { outcome: SerialisedOutcome; children: any[]; [key: string]: any }): any {
        return {
            ...activity,
            outcome: outcomeCodeToDisplayString(activity.outcome.code),
            children: activity.children.map(child => this.mapActivityOutcome(child)),
        };
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
