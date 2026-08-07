import type { FileSystem, RequirementsHierarchy } from '@serenity-js/core/io';
import { Path } from '@serenity-js/core/io';

import type { RunData } from '../model/RunData.js';
import type { AggregatorConfig } from './ReportAggregator.js';
import { ReportAggregator } from './ReportAggregator.js';

/**
 * Reads all test-runs db.json files from the local output directory and produces
 * the aggregated data.js snapshot. Used in crew member mode where the reporter
 * writes artifacts directly to `test-runs/`.
 *
 * @package
 */
export class SingleSourceAggregator extends ReportAggregator {

    constructor(
        fileSystem: FileSystem,
        config: AggregatorConfig,
        requirementsHierarchy: RequirementsHierarchy,
        projectFileSystem: FileSystem,
        warn: typeof console.warn = console.warn,
    ) {
        super(fileSystem, config, requirementsHierarchy, projectFileSystem, warn);
    }

    aggregate(): void {
        const runDirectories = this.findRunDirectories();
        this.pruneOldRuns(runDirectories);
        const allRuns = this.loadRuns(runDirectories);
        this.buildSnapshot(allRuns);
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
}
