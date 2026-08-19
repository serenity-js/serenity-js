import type { FileSystem, RequirementsHierarchy } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import { buildCapabilities } from '../capabilities/buildCapabilities.js';
import { buildHistory } from '../history/buildHistory.js';
import {
    IncompatibleSchemaError,
    InvalidRunDataError,
    validateRunData
} from '../model/index.js';
import type { RunData } from '../model/RunData.js';
import type {
    ReportData,
    ReportScenario,
} from '../reporting/ReportData.js';
import { CURRENT_REPORT_DATA_SCHEMA_VERSION } from '../reporting/ReportData.js';
import { buildSystemContext, computeTagStats } from './computeStats.js';
import { computeDegradedRecovered, identifyUnstableTests } from './identifyUnstableTests.js';
import { buildExecutionHistory, enrichSingleScenario } from './mapScenarioToReport.js';
import { SummaryJsonWriter } from './SummaryJsonWriter.js';

export interface AggregatorConfig {
    consistencyWindow: number;
    maxHistory?: number;
    title?: string;
    buildCapabilities?: boolean;
}

/**
 * Abstract base class for report aggregation. Provides shared snapshot generation logic.
 *
 * @internal
 */
export abstract class ReportAggregator {

    constructor(
        protected readonly fileSystem: FileSystem,
        protected readonly config: AggregatorConfig,
        protected readonly requirementsHierarchy: RequirementsHierarchy,
        protected readonly warn: typeof console.warn = console.warn,
    ) {
    }

    abstract aggregate(...args: unknown[]): void;

    protected buildSnapshot(allRuns: RunData[]): void {
        if (allRuns.length === 0) {
            return;
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
            capabilities: this.config.buildCapabilities ? buildCapabilities(latestRun, allRuns, this.requirementsHierarchy) : undefined,
            specDirectory: this.resolveSpecDirectoryForClient(),
        };

        const js = `window.__SERENITY_REPORT_DATA__ = ${ JSON.stringify(snapshot, undefined, 2) };\n`;
        this.fileSystem.storeSync(Path.from('data.js'), js, 'utf8');

        const specDirectoryPath = (() => { try { return this.requirementsHierarchy.rootDirectory().value; } catch { return undefined; } })();
        new SummaryJsonWriter(this.fileSystem).write(snapshot, specDirectoryPath);
    }

    protected pruneOldRuns(runDirectories: Path[]): void {
        if (this.config.maxHistory && runDirectories.length > this.config.maxHistory) {
            const toRemove = runDirectories.slice(0, runDirectories.length - this.config.maxHistory);
            for (const directory of toRemove) {
                this.fileSystem.removeSync(directory);
            }
            runDirectories.splice(0, runDirectories.length - this.config.maxHistory);
        }
    }

    protected safeParseRunData(content: string, path: string): RunData | null {
        try {
            const raw = JSON.parse(content);
            return validateRunData(raw, path);
        } catch (error) {
            if (error instanceof InvalidRunDataError || error instanceof IncompatibleSchemaError || error instanceof SyntaxError) {
                this.warn(`[html-reporter] Skipping ${ path }: ${ (error as Error).message }`);
                return null;
            }
            throw error;
        }
    }

    protected findRunDirectories(): Path[] {
        const testRunsDirectory = Path.from('test-runs');

        if (!this.fileSystem.exists(testRunsDirectory)) {
            return [];
        }

        const entries = this.fileSystem.readdirSync(testRunsDirectory);

        return entries
            .flatMap(entry => this.resolveDbJsonDirectories(testRunsDirectory.join(Path.from(entry))))
            .sort((a, b) => a.value.localeCompare(b.value));
    }

    /**
     * Resolves directories containing db.json or db-*.json at one or two levels:
     * - Run-level: the directory itself contains db.json or db-{workerId}.json
     * - Module-level: subdirectories contain db.json or db-{workerId}.json (CI multi-module layout)
     */
    private resolveDbJsonDirectories(entryPath: Path): Path[] {
        if (this.hasDbFiles(entryPath)) {
            return [entryPath];
        }

        return this.safeReaddir(entryPath)
            .map(sub => entryPath.join(Path.from(sub)))
            .filter(subPath => this.hasDbFiles(subPath));
    }

    private hasDbFiles(directoryPath: Path): boolean {
        if (this.fileSystem.exists(directoryPath.join(Path.from('db.json')))) {
            return true;
        }

        return this.safeReaddir(directoryPath)
            .some(entry => /^db-[^/]+\.json$/.test(entry));
    }

    private safeReaddir(path: Path): string[] {
        try {
            return this.fileSystem.readdirSync(path);
        } catch {
            return [];
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
