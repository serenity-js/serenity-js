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

import { SingleSourceAggregator } from './aggregation/index.js';
import type { HtmlReporterConfig } from './HtmlReporterConfig.js';
import { ReportTemplateWriter } from './reporting/index.js';

/**
 * A [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/) that aggregates
 * archived test run data and generates the HTML report (`data.js` + `index.html`).
 *
 * Unlike {@link HtmlReporter}, this crew member does **not** collect test data during the run.
 * It only performs the aggregation and HTML generation step. Use it when data collection
 * is handled separately by {@link TestRunArchiver} — for example, in CI pipelines where
 * parallel jobs each archive their own data, and a final step aggregates everything into one report.
 *
 * The `serenity-js-html-reporter aggregate` CLI command uses `HtmlReportGenerator` internally.
 *
 * ## When to use `HtmlReportGenerator` instead of `HtmlReporter`
 *
 * Use {@link HtmlReporter} (the default) when you want a single crew member to handle
 * both data collection and report generation in the same process.
 *
 * Use `HtmlReportGenerator` when:
 * - Test data is archived separately (by {@link TestRunArchiver} or an external process)
 * - Report generation runs in a dedicated post-processing step
 * - You aggregate results from multiple CI jobs into a single report
 *
 * ## Registering as a crew member
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 *
 * configure({
 *   crew: [
 *     ['@serenity-js/html-reporter:HtmlReportGenerator', {
 *       outputDirectory: './reports/serenity-js',
 *       specDirectory: './spec',
 *     }],
 *   ],
 * });
 * ```
 *
 * ## Standalone usage via CLI
 *
 * When test data has been archived by {@link TestRunArchiver} in prior CI steps,
 * generate the report using the CLI:
 *
 * ```sh
 * npx @serenity-js/html-reporter aggregate \
 *   --input "./ci-artifacts/test-runs/**" \
 *   --output ./reports/serenity-js \
 *   --spec-dir ./spec
 * ```
 *
 * ## Programmatic registration with `fromJSON`
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 * import { HtmlReportGenerator } from '@serenity-js/html-reporter';
 *
 * configure({
 *   crew: [
 *     HtmlReportGenerator.fromJSON({
 *       outputDirectory: './reports/serenity-js',
 *       specDirectory: './spec',
 *     }),
 *   ],
 * });
 * ```
 *
 * @group Stage
 */
export class HtmlReportGenerator implements StageCrewMember {

    /**
     * Creates a {@link StageCrewMemberBuilder} that will instantiate the `HtmlReportGenerator`
     * with the provided {@link HtmlReporterConfig}.
     *
     * @param config
     *  Configuration options for the generator. All properties are optional.
     */
    static fromJSON(config: HtmlReporterConfig = {}): StageCrewMemberBuilder<HtmlReportGenerator> {
        return new HtmlReportGeneratorBuilder(config);
    }

    constructor(
        private readonly aggregator: SingleSourceAggregator,
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
 * @internal
 */
class HtmlReportGeneratorBuilder implements StageCrewMemberBuilder<HtmlReportGenerator> {

    constructor(private readonly config: HtmlReporterConfig) {
    }

    build({ stage }: StageCrewMemberBuilderDependencies): HtmlReportGenerator {
        ensure('stage', stage, isDefined());

        const outputDirectory = Path.from(this.config.outputDirectory || './reports/serenity-js');
        const outputFileSystem = new FileSystem(outputDirectory);
        const projectFileSystem = new FileSystem(Path.from(process.cwd()));

        const aggregator = new SingleSourceAggregator(outputFileSystem, {
            consistencyWindow: this.config.consistencyWindow ?? 5,
            maxHistory: this.config.maxHistory,
            title: this.config.title,
            buildCapabilities: !!this.config.specDirectory,
        }, new RequirementsHierarchy(
            projectFileSystem,
            this.config.specDirectory ? Path.from(this.config.specDirectory) : undefined,
        ),
        );

        const templateWriter = new ReportTemplateWriter(outputFileSystem);

        return new HtmlReportGenerator(aggregator, templateWriter, stage);
    }
}
