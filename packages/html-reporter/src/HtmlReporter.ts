import type { Stage, StageCrewMember, StageCrewMemberBuilder, StageCrewMemberBuilderDependencies } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import { FileSystem, ModuleLoader, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { ensure, isDefined } from 'tiny-types';

import { ArtifactWriter } from './ArtifactWriter.js';
import { CIDetector } from './CiDetector.js';
import { DataSnapshotAggregator } from './DataSnapshotAggregator.js';
import type { HtmlReporterConfig } from './HtmlReporterConfig.js';
import { HtmlReportGenerator } from './HtmlReportGenerator.js';
import { ReportTemplateWriter } from './ReportTemplateWriter.js';
import { RunDataWriter } from './RunDataWriter.js';
import { SceneDataCollector } from './SceneDataCollector.js';
import { SystemContextDetector } from './SystemContextDetector.js';
import { TestRunArchiver } from './TestRunArchiver.js';

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

        const archiver = new TestRunArchiver(artifactWriter, sceneDataCollector, runDataWriter, systemContextDetector, this.config.testRunId, stage);

        // HtmlReportGenerator dependencies
        const projectFileSystem = new FileSystem(Path.from(process.cwd()));
        const aggregator = new DataSnapshotAggregator(outputFileSystem, {
            stabilityWindow: this.config.stabilityWindow ?? 5,
            maxHistory: this.config.maxHistory,
            title: this.config.title,
        }, this.config.specDirectory
            ? new RequirementsHierarchy(projectFileSystem, Path.from(this.config.specDirectory))
            : undefined,
        this.config.specDirectory ? projectFileSystem : undefined,
        );
        const templateWriter = new ReportTemplateWriter(outputFileSystem);

        const generator = new HtmlReportGenerator(aggregator, templateWriter, stage);

        return new HtmlReporter(archiver, generator);
    }
}
