import type { FileSystem, RequirementsHierarchy } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import type { RunData } from '../model/RunData.js';
import { classifyRunPath } from './classifyRunPath.js';
import { aggregateModuleMetadata } from './moduleMetadata.js';
import type { AggregatorConfig } from './ReportAggregator.js';
import { ReportAggregator } from './ReportAggregator.js';
import { mergeAdditively, mergeAsRetry } from './resolveRetries.js';

/**
 * Reads db.json files from arbitrary external paths, copies artifacts into the
 * output directory, and produces the aggregated data.js snapshot. Used in CLI
 * aggregate mode.
 *
 * @package
 */
export class MultiSourceAggregator extends ReportAggregator {

    constructor(
        fileSystem: FileSystem,
        config: AggregatorConfig,
        requirementsHierarchy: RequirementsHierarchy,
        projectFileSystem: FileSystem,
        private readonly sourceFileSystem: FileSystem,
        warn: typeof console.warn = console.warn,
    ) {
        super(fileSystem, config, requirementsHierarchy, projectFileSystem, warn);
    }

    aggregate(externalRunPaths: string[]): void {
        let allRuns = this.loadExternalRuns(externalRunPaths);

        if (allRuns.length === 0) {
            return;
        }

        // Enforce maxHistory by slicing the sorted runs array,
        // then prune output dirs that fall outside the window.
        if (this.config.maxHistory) {
            if (allRuns.length > this.config.maxHistory) {
                allRuns = allRuns.slice(allRuns.length - this.config.maxHistory);
            }
            this.pruneOldRuns(this.findRunDirectories());
        }

        this.buildSnapshot(allRuns);
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

            const classification = classifyRunPath(databaseJsonPath);
            const isRunLevel = classification?.isRunLevel ?? false;

            results.push({ run, path: databaseJsonPath, isRunLevel });

            // Copy sibling artifacts before any merging
            if (classification) {
                this.copyArtifactsFromSource(databaseJsonPath, classification.runId, classification.subDirectory);
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

            // Collect and aggregate module metadata by moduleId
            // This handles WebdriverIO parallel workers that produce multiple db-*.json files
            // with the same moduleId - they should be aggregated into a single module entry
            const modules = aggregateModuleMetadata(runsToMerge);

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

    private persistMergedRuns(merged: Map<string, RunData>): void {
        for (const [runId, finalRun] of merged) {
            const outputPath = Path.from('test-runs').join(Path.from(runId)).join(Path.from('db.json'));
            this.fileSystem.ensureDirectoryExistsAtSync(Path.from('test-runs').join(Path.from(runId)));
            this.fileSystem.storeSync(outputPath, JSON.stringify(finalRun, undefined, 2), 'utf8');
        }
    }

    private copyArtifactsFromSource(databaseJsonPath: string, runId: string, subDirectory: string): void {
        const safeRunId = runId.replaceAll(':', '-');
        // Strip both db.json and db-{workerId}.json from path
        const sourceDirectory = Path.from(databaseJsonPath.replace(/\/db(-[^/]+)?\.json$/, ''));
        const targetDirectory = subDirectory === '.'
            ? Path.from('test-runs').join(Path.from(safeRunId))
            : Path.from('test-runs').join(Path.from(safeRunId)).join(Path.from(subDirectory));

        this.fileSystem.ensureDirectoryExistsAtSync(targetDirectory);

        const entries = this.sourceFileSystem.readdirSync(sourceDirectory);
        for (const entry of entries) {
            // Skip all db*.json files (merged db.json is written separately at the build-level path)
            if (/^db(-[^/]+)?\.json$/.test(entry)) {
                continue;
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
}
