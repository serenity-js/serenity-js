import type { FileSystem } from '@serenity-js/core/io';
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

import type { RunData } from './model/RunData.js';

interface AggregatorConfig {
    stabilityWindow: number;
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
    ) {
    }

    aggregate(): void {
        const runDirectories = this.findRunDirectories();

        // Apply maxHistory pruning
        if (this.config.maxHistory && runDirectories.length > this.config.maxHistory) {
            const toRemove = runDirectories.slice(0, runDirectories.length - this.config.maxHistory);
            for (const directory of toRemove) {
                this.fileSystem.removeSync(directory);
            }
            runDirectories.splice(0, runDirectories.length - this.config.maxHistory);
        }

        // Parse all run data files
        const allRuns: RunData[] = runDirectories.map(directory => {
            const databaseJsonPath = directory.join(Path.from('db.json'));
            const content = this.fileSystem.readFileSync(databaseJsonPath, { encoding: 'utf8' }) as string;
            return JSON.parse(content) as RunData;
        });

        const latestRun = allRuns[allRuns.length - 1];

        // Build the data snapshot
        const snapshot = {
            summary: {
                title: this.config.title || latestRun.testRunner,
                totalScenarios: latestRun.scenes.length,
                outcomes: latestRun.outcomes,
                duration: latestRun.duration,
                startedAt: latestRun.timestamp,
                finishedAt: latestRun.timestamp, // simplified
                testRunner: latestRun.testRunner,
            },
            scenarios: latestRun.scenes.map(scene => ({
                ...scene,
                outcome: outcomeCodeToDisplayString(scene.outcome.code),
                activities: scene.activities.map(activity => this.mapActivityOutcome(activity)),
            })),
            history: allRuns.map(run => ({
                timestamp: run.timestamp,
                duration: run.duration,
                outcomes: run.outcomes,
                label: this.resolveRunLabel(run.timestamp),
            })),
            tags: latestRun.tags,
            unstableTests: this.identifyUnstableTests(allRuns),
            systemContext: latestRun.systemContext ? {
                nodeVersion: latestRun.systemContext.nodeVersion,
                os: latestRun.systemContext.os,
                serenityVersion: latestRun.systemContext.serenityVersion,
                testRunner: { name: latestRun.testRunner, version: latestRun.testRunnerVersion },
                browsers: this.extractBrowsers(latestRun),
                ci: latestRun.systemContext.runtime,
                projectName: latestRun.systemContext.projectName,
                packageManager: latestRun.systemContext.packageManager,
                environmentUnderTest: latestRun.systemContext.environmentUnderTest,
            } : undefined,
        };

        // Write data.js
        const js = `window.__SERENITY_REPORT_DATA__ = ${ JSON.stringify(snapshot, undefined, 2) };\n`;
        this.fileSystem.storeSync(Path.from('data.js'), js, 'utf8');
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

    private identifyUnstableTests(allRuns: RunData[]): Array<{ name: string; category: string; source: { path: string; line: number }; flakinessRate: number }> {
        const recentRuns = allRuns.slice(-this.config.stabilityWindow);

        // Collect outcomes per test identity (name@path)
        const testOutcomes = new Map<string, { name: string; category: string; source: { path: string; line: number }; outcomes: string[] }>();

        for (const run of recentRuns) {
            for (const scene of run.scenes) {
                const identity = `${ scene.name }@${ scene.source.path }`;
                if (!testOutcomes.has(identity)) {
                    testOutcomes.set(identity, { name: scene.name, category: scene.category, source: scene.source, outcomes: [] });
                }
                testOutcomes.get(identity).outcomes.push(outcomeCodeToDisplayString(scene.outcome.code));
            }
        }

        // Find tests with mixed outcomes
        const unstable: Array<{ name: string; category: string; source: { path: string; line: number }; flakinessRate: number }> = [];

        for (const [, test] of testOutcomes) {
            const uniqueOutcomes = new Set(test.outcomes);
            if (uniqueOutcomes.size > 1) {
                const failures = test.outcomes.filter(o => o !== 'SUCCESS').length;
                unstable.push({
                    name: test.name,
                    category: test.category,
                    source: test.source,
                    flakinessRate: failures / test.outcomes.length,
                });
            }
        }

        return unstable.sort((a, b) => b.flakinessRate - a.flakinessRate);
    }

    private mapActivityOutcome(activity: { outcome: SerialisedOutcome; children: any[]; [key: string]: any }): any {
        return {
            ...activity,
            outcome: outcomeCodeToDisplayString(activity.outcome.code),
            children: activity.children.map(child => this.mapActivityOutcome(child)),
        };
    }

    private resolveRunLabel(timestamp: string): string {
        return new Date(timestamp).toISOString();
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
