import type { FileSystem, RequirementsHierarchy } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import type { RunData } from '../model/RunData.js';
import type { AggregatorConfig } from './ReportAggregator.js';
import { ReportAggregator } from './ReportAggregator.js';
import { mergeAdditively } from './resolveRetries.js';

/**
 * Reads all test-runs db.json files from the local output directory and produces
 * the aggregated data.js snapshot. Used in crew member mode where the reporter
 * writes artifacts directly to `test-runs/`.
 *
 * @internal
 */
export class SingleSourceAggregator extends ReportAggregator {

    constructor(
        fileSystem: FileSystem,
        config: AggregatorConfig,
        requirementsHierarchy: RequirementsHierarchy,
        warn: typeof console.warn = console.warn,
    ) {
        super(fileSystem, config, requirementsHierarchy, warn);
    }

    aggregate(): void {
        const runDirectories = this.findRunDirectories();

        if (runDirectories.length === 0) {
            this.warn('[html-reporter] No test run data found in test-runs/ directory. The report will not include test results.');
            return;
        }

        this.pruneOldRuns(runDirectories);
        const allRuns = this.loadRuns(runDirectories);
        this.buildSnapshot(allRuns);
    }

    private loadRuns(runDirectories: Path[]): RunData[] {
        const runs: RunData[] = [];

        for (const directory of runDirectories) {
            const run = this.loadRunFromDirectory(directory);
            if (run) {
                runs.push(run);
            }
        }

        return runs;
    }

    private loadRunFromDirectory(directory: Path): RunData | null {
        const databaseJsonPath = directory.join(Path.from('db.json'));

        // Prefer db.json when it exists (single-worker result or pre-merged aggregate)
        if (this.fileSystem.exists(databaseJsonPath)) {
            const content = this.fileSystem.readFileSync(databaseJsonPath, { encoding: 'utf8' }) as string;
            return this.safeParseRunData(content, databaseJsonPath.value);
        }

        // Otherwise, discover and merge db-{workerId}.json files
        const workerFiles = this.findWorkerFiles(directory);
        if (workerFiles.length === 0) {
            return null;
        }

        const workerRuns: RunData[] = [];
        for (const workerFile of workerFiles) {
            const content = this.fileSystem.readFileSync(workerFile, { encoding: 'utf8' }) as string;
            const run = this.safeParseRunData(content, workerFile.value);
            if (run) {
                workerRuns.push(run);
            }
        }

        if (workerRuns.length === 0) {
            return null;
        }

        return workerRuns.reduce((merged, run) => mergeAdditively(merged, run));
    }

    private findWorkerFiles(directory: Path): Path[] {
        try {
            return this.fileSystem.readdirSync(directory)
                .filter(entry => /^db-[^/]+\.json$/.test(entry))
                .map(entry => directory.join(Path.from(entry)));
        } catch {
            return [];
        }
    }
}
