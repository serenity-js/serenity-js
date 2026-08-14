import type { Stage, StageCrewMember, StageCrewMemberBuilder, StageCrewMemberBuilderDependencies } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import { FileSystem, ModuleLoader, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { ensure, isDefined } from 'tiny-types';

import { SingleSourceAggregator } from './aggregation/index.js';
import { ArtifactWriter, CIDetector, detectAttemptNumber, detectModuleId, detectTestRunId, RunDataWriter, SceneDataCollector, SystemContextDetector, TestRunArchiver } from './collection/index.js';
import type { HtmlReporterConfig } from './HtmlReporterConfig.js';
import { HtmlReportGenerator } from './HtmlReportGenerator.js';
import { ReportTemplateWriter } from './reporting/index.js';

/**
 * A [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/) that produces
 * a self-contained static HTML report with trend analysis, consistency classification,
 * and living documentation.
 *
 * `HtmlReporter` handles the **full lifecycle** — it collects test data during the run
 * (screenshots, activity trees, domain events) AND generates the aggregated HTML report
 * when the test run finishes. Internally, it composes {@link TestRunArchiver} (data collection)
 * and {@link HtmlReportGenerator} (report generation).
 *
 * For CI pipelines where data collection and report generation happen in separate steps,
 * use {@link TestRunArchiver} and {@link HtmlReportGenerator} independently instead.
 *
 * ## Registering HTML Reporter with Playwright Test
 *
 * ```ts
 * // playwright.config.ts
 * import { defineConfig } from '@playwright/test';
 * import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';
 *
 * export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
 *   reporter: [
 *     ['line'],
 *     ['@serenity-js/playwright-test', {
 *       crew: [
 *         ['@serenity-js/html-reporter', {
 *           outputDirectory: './reports/serenity-js',
 *           specDirectory: './tests',
 *         }],
 *       ],
 *     }],
 *   ],
 * });
 * ```
 *
 * ## Registering HTML Reporter with WebdriverIO
 *
 * ```ts
 * // wdio.conf.ts
 * import type { WebdriverIOConfig } from '@serenity-js/webdriverio';
 *
 * export const config: WebdriverIOConfig = {
 *   framework: '@serenity-js/webdriverio',
 *   serenity: {
 *     crew: [
 *       ['@serenity-js/html-reporter', {
 *         outputDirectory: './reports/serenity-js',
 *         specDirectory: './tests',
 *       }],
 *     ],
 *   },
 * };
 * ```
 *
 * ## Registering HTML Reporter programmatically (Cucumber, Mocha, Jasmine)
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 *
 * configure({
 *   crew: [
 *     ['@serenity-js/html-reporter', {
 *       outputDirectory: './reports/serenity-js',
 *       specDirectory: './tests',
 *     }],
 *   ],
 * });
 * ```
 *
 * ## Using string-based registration with defaults
 *
 * When no configuration is needed, register the reporter as a module path string:
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 *
 * configure({
 *   crew: [
 *     '@serenity-js/html-reporter',
 *   ],
 * });
 * ```
 *
 * ## Using `fromJSON` for programmatic registration
 *
 * The {@link HtmlReporter.fromJSON} static method creates a
 * [`StageCrewMemberBuilder`](https://serenity-js.org/api/core/interface/StageCrewMemberBuilder/)
 * from an {@link HtmlReporterConfig} object:
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 * import { HtmlReporter } from '@serenity-js/html-reporter';
 *
 * configure({
 *   crew: [
 *     HtmlReporter.fromJSON({
 *       outputDirectory: './target/site/serenity',
 *       specDirectory: './tests',
 *       title: 'My Project — Acceptance Tests',
 *     }),
 *   ],
 * });
 * ```
 *
 * ## Learn more
 *
 * - {@link HtmlReporterConfig} — configuration options
 * - {@link TestRunArchiver} — data collection only (for split CI workflows)
 * - {@link HtmlReportGenerator} — report generation only (for post-hoc aggregation)
 * - [HTML Reporter Handbook](https://serenity-js.org/handbook/reporting/html-reporter/)
 *
 * @group Stage
 */
export class HtmlReporter implements StageCrewMember {

    /**
     * Creates a {@link StageCrewMemberBuilder} that will instantiate the `HtmlReporter`
     * with the provided {@link HtmlReporterConfig}.
     *
     * This is the programmatic equivalent of registering the reporter as a tuple:
     * `['@serenity-js/html-reporter', config]`.
     *
     * @param config
     *  Configuration options for the reporter. All properties are optional.
     */
    static fromJSON(config: HtmlReporterConfig = {}): StageCrewMemberBuilder<HtmlReporter> {
        return new HtmlReporterBuilder(config);
    }

    constructor(
        private readonly archiver: TestRunArchiver,
        private readonly generator: HtmlReportGenerator,
    ) {
        ensure('archiver', archiver, isDefined());
        ensure('generator', generator, isDefined());
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.archiver.assignedTo(stage);
        this.generator.assignedTo(stage);
        return this;
    }

    notifyOf(event: DomainEvent): void {
        this.archiver.notifyOf(event);
        this.generator.notifyOf(event);
    }
}

/**
 * @package
 */
class HtmlReporterBuilder implements StageCrewMemberBuilder<HtmlReporter> {

    constructor(private readonly config: HtmlReporterConfig) {
    }

    build({ stage }: StageCrewMemberBuilderDependencies): HtmlReporter {
        ensure('stage', stage, isDefined());

        const outputDirectory = Path.from(this.config.outputDirectory || './reports/serenity-js');
        const outputFileSystem = new FileSystem(outputDirectory);

        // TestRunArchiver dependencies
        const artifactWriter = new ArtifactWriter(outputFileSystem);
        const sceneDataCollector = new SceneDataCollector();
        const runDataWriter = new RunDataWriter(outputFileSystem);
        const systemContextDetector = new SystemContextDetector(new CIDetector(process.env), new ModuleLoader(process.cwd()), { projectName: this.config.projectName, runtime: this.config.ci });

        const testRunId = this.config.testRunId || detectTestRunId();
        const moduleId = this.config.moduleId || (this.config.testRunId ? undefined : detectModuleId());

        const archiver = new TestRunArchiver({ artifactWriter, sceneDataCollector, runDataWriter, systemContextDetector }, { testRunId, moduleId, attempt: detectAttemptNumber() }, stage);

        // HtmlReportGenerator dependencies
        const projectFileSystem = new FileSystem(Path.from(process.cwd()));
        const requirementsHierarchy = new RequirementsHierarchy(
            projectFileSystem,
            this.config.specDirectory ? Path.from(this.config.specDirectory) : undefined,
        );
        const aggregator = new SingleSourceAggregator(outputFileSystem, {
            consistencyWindow: this.config.consistencyWindow ?? 5,
            maxHistory: this.config.maxHistory,
            title: this.config.title,
            buildCapabilities: !!this.config.specDirectory,
        }, requirementsHierarchy,
        );
        const templateWriter = new ReportTemplateWriter(outputFileSystem);

        const generator = new HtmlReportGenerator(aggregator, templateWriter, stage);

        return new HtmlReporter(archiver, generator);
    }
}
