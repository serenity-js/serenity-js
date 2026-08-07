import type { FileSystem, RequirementsHierarchy } from '@serenity-js/core/io';

import { MultiSourceAggregator } from './MultiSourceAggregator.js';
import type { AggregatorConfig } from './ReportAggregator.js';
import { SingleSourceAggregator } from './SingleSourceAggregator.js';

/**
 * Backwards-compatible facade that delegates to {@link SingleSourceAggregator}
 * or {@link MultiSourceAggregator} depending on how `aggregate()` is called.
 *
 * @package
 * @deprecated Use {@link SingleSourceAggregator} or {@link MultiSourceAggregator} directly.
 */
export class DataSnapshotAggregator {

    private readonly singleSource: SingleSourceAggregator;
    private readonly multiSource: MultiSourceAggregator;

    constructor(
        fileSystem: FileSystem,
        config: AggregatorConfig,
        requirementsHierarchy: RequirementsHierarchy,
        projectFileSystem: FileSystem,
        sourceFileSystem: FileSystem,
        warn: typeof console.warn = console.warn,
    ) {
        this.singleSource = new SingleSourceAggregator(fileSystem, config, requirementsHierarchy, projectFileSystem, warn);
        this.multiSource = new MultiSourceAggregator(fileSystem, config, requirementsHierarchy, projectFileSystem, sourceFileSystem, warn);
    }

    aggregate(externalRunPaths?: string[]): void {
        if (externalRunPaths) {
            this.multiSource.aggregate(externalRunPaths);
        } else {
            this.singleSource.aggregate();
        }
    }
}
