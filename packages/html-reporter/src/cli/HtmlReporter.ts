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
 * A {@link StageCrewMember} that produces a self-contained static HTML report.
 * Composes {@link TestRunArchiver} (data collection) and {@link HtmlReportGenerator} (report generation).
 *
 * ## Registering the HTML Reporter
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
 * @group Stage
 */
export class HtmlReporter implements StageCrewMember {

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
        }, requirementsHierarchy, projectFileSystem,
        );
        const templateWriter = new ReportTemplateWriter(outputFileSystem);

        const generator = new HtmlReportGenerator(aggregator, templateWriter, stage);

        return new HtmlReporter(archiver, generator);
    }
}
