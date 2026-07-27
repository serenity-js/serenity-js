import type { FileSystem, RequirementsHierarchy } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import { buildSystemContext, computeTagStats } from './aggregation/computeStats.js';
import { buildCapabilities } from './capabilities/buildCapabilities.js';
import { buildHistory } from './history/buildHistory.js';
import { computeDegradedRecovered, identifyUnstableTests } from './identifyUnstableTests.js';
import { buildExecutionHistory, enrichSingleScenario } from './mapScenarioToReport.js';
import {
    IncompatibleSchemaError,
    InvalidRunDataError,
    validateRunData
} from './model/index.js';
import type { RunData } from './model/RunData.js';
import type {
    ReportData,
    ReportScenario,
} from './ReportData.js';
import { CURRENT_REPORT_DATA_SCHEMA_VERSION } from './ReportData.js';
import { mergeAdditively, mergeAsRetry } from './resolveRetries.js';
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
        const { newFailures, newPasses } = computeDegradedRecovered(allRuns);

        const snapshot: ReportData = {
            schemaVersion: CURRENT_REPORT_DATA_SCHEMA_VERSION,
            summary: this.buildSummary(latestRun),
            scenarios: this.enrichScenarios(latestRun, allRuns),
            history: buildHistory(allRuns),
            tags: computeTagStats(latestRun),
            inconsistentTests: identifyUnstableTests(allRuns, this.config.consistencyWindow),
            newFailures,
            newPasses,
            systemContext: buildSystemContext(latestRun),
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

    private loadAndValidateRuns(paths: string[]): Array<{ run: RunData; path: string; isRunLevel: boolean }> {
        const results: Array<{ run: RunData; path: string; isRunLevel: boolean }> = [];

        for (const databaseJsonPath of paths) {
            const content = this.sourceFileSystem.readFileSync(Path.from(databaseJsonPath), { encoding: 'utf8' }) as string;
            const run = this.safeParseRunData(content, databaseJsonPath);
            if (!run) continue;

            // Determine if this is a run-level db.json (pre-merged) vs module-level (individual module)
            // Run-level: test-runs/8334/db.json (relative path after test-runs/ has no slash)
            // Module-level: test-runs/8334/cucumber-1/db.json (relative path has a slash)
            const pathWithoutDatabase = databaseJsonPath.replace(/\/db\.json$/, '');
            const testRunsIndex = pathWithoutDatabase.lastIndexOf('/test-runs/');
            let isRunLevel = false;
            if (testRunsIndex !== -1) {
                const relative = pathWithoutDatabase.slice(testRunsIndex + '/test-runs/'.length);
                const slashIndex = relative.indexOf('/');
                isRunLevel = slashIndex === -1; // No slash = run-level (e.g., "8334")
            }

            results.push({ run, path: databaseJsonPath, isRunLevel });

            // Copy sibling artifacts before any merging
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

    private groupByTestRunId(runs: Array<{ run: RunData; path: string; isRunLevel: boolean }>): Map<string, Array<{ run: RunData; isRunLevel: boolean }>> {
        const groups = new Map<string, Array<{ run: RunData; isRunLevel: boolean }>>();
        for (const { run, isRunLevel } of runs) {
            const groupId = run.testRunId || run.startedAt.replaceAll(':', '-');
            if (!groups.has(groupId)) groups.set(groupId, []);
            groups.get(groupId)!.push({ run, isRunLevel });
        }
        return groups;
    }

    private mergeRunGroups(groups: Map<string, Array<{ run: RunData; isRunLevel: boolean }>>): Map<string, RunData> {
        const merged = new Map<string, RunData>();

        for (const [runId, runsInGroup] of groups) {
            // If we have fresh module-level db.json files for this run, exclude any stale
            // run-level (pre-merged) db.json. The run-level file contains outdated merged data
            // from a previous CI attempt and would incorrectly contribute "zombie" module data
            // from modules that crashed in the current run but succeeded previously.
            const hasModuleLevelRuns = runsInGroup.some(r => !r.isRunLevel);
            const filteredRuns = hasModuleLevelRuns
                ? runsInGroup.filter(r => !r.isRunLevel)
                : runsInGroup;

            const runsToMerge = filteredRuns.map(r => r.run);

            // Collect module metadata before merging
            const modules = runsToMerge.map((run, index) => ({
                moduleId: this.deriveModuleId(run, index),
                startedAt: run.startedAt,
                finishedAt: run.finishedAt,
                outcome: this.deriveModuleOutcome(run),
                outcomes: run.outcomes,
            }));

            // Sub-group by attempt number (missing attempt defaults to 1)
            const byAttempt = new Map<number, RunData[]>();
            for (const run of runsToMerge) {
                const attempt = run.attempt ?? 1;
                if (!byAttempt.has(attempt)) byAttempt.set(attempt, []);
                byAttempt.get(attempt)!.push(run);
            }

            // Additive merge within each attempt
            const attemptNumbers = [...byAttempt.keys()].sort((a, b) => a - b);
            const mergedByAttempt: RunData[] = attemptNumbers.map(attemptNumber => {
                const runsForAttempt = byAttempt.get(attemptNumber)!;
                return runsForAttempt.reduce((base, run) => mergeAdditively(base, run));
            });

            // Retry merge across attempts (in order)
            const finalRun = mergedByAttempt.reduce((previous, current) => mergeAsRetry(previous, current));
            finalRun.modules = modules;
            merged.set(runId, finalRun);
        }

        return merged;
    }

    private deriveModuleId(run: RunData, index: number): string {
        if (run.moduleId) {
            return run.moduleId;
        }
        if (run.systemContext?.projectName) {
            return run.systemContext.projectName;
        }
        return `module-${index + 1}`;
    }

    private deriveModuleOutcome(run: RunData): 'passed' | 'failed' | 'incomplete' {
        if (!run.finishedAt) {
            return 'incomplete';
        }
        const { failed = 0, error = 0, compromised = 0 } = run.outcomes;
        return (failed + error + compromised) > 0 ? 'failed' : 'passed';
    }

    private persistMergedRuns(merged: Map<string, RunData>): void {
        for (const [runId, finalRun] of merged) {
            const outputPath = Path.from('test-runs').join(Path.from(runId)).join(Path.from('db.json'));
            this.fileSystem.ensureDirectoryExistsAtSync(Path.from('test-runs').join(Path.from(runId)));
            this.fileSystem.storeSync(outputPath, JSON.stringify(finalRun, undefined, 2), 'utf8');
        }
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

    private buildSummary(latestRun: RunData): { title: string; totalScenarios: number; outcomes: typeof latestRun.outcomes; duration: number; startedAt: string; finishedAt: string; testRunner: string } {
        const duration = latestRun.finishedAt
            ? new Date(latestRun.finishedAt).getTime() - new Date(latestRun.startedAt).getTime()
            : 0;

        const testRunnerName = latestRun.testRunner?.name || 'unknown';

        return {
            title: this.config.title || testRunnerName,
            totalScenarios: latestRun.scenes.length,
            outcomes: latestRun.outcomes,
            duration,
            startedAt: latestRun.startedAt,
            finishedAt: latestRun.finishedAt || latestRun.startedAt,
            testRunner: testRunnerName,
        };
    }

    private enrichScenarios(latestRun: RunData, allRuns: RunData[]): ReportScenario[] {
        return latestRun.scenes.map(scene => {
            const executionHistory = buildExecutionHistory(scene, allRuns);
            return enrichSingleScenario(scene, executionHistory);
        });
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
