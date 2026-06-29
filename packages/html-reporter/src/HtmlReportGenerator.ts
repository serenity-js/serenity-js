import type { Stage, StageCrewMember, StageCrewMemberBuilder, StageCrewMemberBuilderDependencies } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import {
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    TestRunFinishes,
} from '@serenity-js/core/events';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { CorrelationId, Description, Name } from '@serenity-js/core/model';
import { ensure, isDefined } from 'tiny-types';

import { DataSnapshotAggregator } from './DataSnapshotAggregator.js';
import type { HtmlReporterConfig } from './HtmlReporterConfig.js';
import { ReportTemplateWriter } from './ReportTemplateWriter.js';

/**
 * A {@link StageCrewMember} that aggregates test run data and generates
 * the HTML report (data.js + index.html).
 *
 * Can also be used standalone (without being a crew member) via the
 * `serenity-js-html-reporter` CLI for post-hoc aggregation of test runs
 * from multiple sources.
 *
 * ## Usage as a crew member
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 *
 * configure({
 *   crew: [
 *     '@serenity-js/html-reporter:HtmlReportGenerator',
 *   ],
 * });
 * ```
 *
 * @group Stage
 */
export class HtmlReportGenerator implements StageCrewMember {

    static fromJSON(config: HtmlReporterConfig = {}): StageCrewMemberBuilder<HtmlReportGenerator> {
        return new HtmlReportGeneratorBuilder(config);
    }

    constructor(
        private readonly aggregator: DataSnapshotAggregator,
        private readonly templateWriter: ReportTemplateWriter,
        private stage?: Stage,
    ) {
        ensure('aggregator', aggregator, isDefined());
        ensure('templateWriter', templateWriter, isDefined());
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof TestRunFinishes) {
            this.generate();
        }
    }

    /**
     * Generates the report. Can be called directly for standalone/CLI usage.
     */
    generate(): void {
        if (this.stage) {
            const id = CorrelationId.create();
            this.stage.announce(new AsyncOperationAttempted(
                new Name(this.constructor.name),
                new Description('Generating HTML report...'),
                id,
                this.stage.currentTime(),
            ));

            try {
                this.aggregator.aggregate();
                this.templateWriter.write();
                this.stage.announce(new AsyncOperationCompleted(id, this.stage.currentTime()));
            } catch (error) {
                this.stage.announce(new AsyncOperationFailed(error as Error, id, this.stage.currentTime()));
            }
        } else {
            this.aggregator.aggregate();
            this.templateWriter.write();
        }
    }
}

/**
 * @package
 */
class HtmlReportGeneratorBuilder implements StageCrewMemberBuilder<HtmlReportGenerator> {

    constructor(private readonly config: HtmlReporterConfig) {
    }

    build({ stage }: StageCrewMemberBuilderDependencies): HtmlReportGenerator {
        ensure('stage', stage, isDefined());

        const outputDirectory = Path.from(this.config.outputDirectory || './reports/serenity-js');
        const outputFileSystem = new FileSystem(outputDirectory);
        const projectFileSystem = new FileSystem(Path.from(process.cwd()));

        const aggregator = new DataSnapshotAggregator(outputFileSystem, {
            consistencyWindow: this.config.consistencyWindow ?? 5,
            maxHistory: this.config.maxHistory,
            title: this.config.title,
        }, this.config.specDirectory
            ? new RequirementsHierarchy(projectFileSystem, Path.from(this.config.specDirectory))
            : undefined,
        this.config.specDirectory ? projectFileSystem : undefined,
        );

        const templateWriter = new ReportTemplateWriter(outputFileSystem);

        return new HtmlReportGenerator(aggregator, templateWriter, stage);
    }
}
