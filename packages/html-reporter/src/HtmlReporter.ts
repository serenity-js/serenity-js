import type { Stage, StageCrewMember, StageCrewMemberBuilder, StageCrewMemberBuilderDependencies } from '@serenity-js/core';
import { DomainEventQueues } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import {
    ActivityRelatedArtifactGenerated,
    ArtifactGenerated,
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
} from '@serenity-js/core/events';
import { FileSystem, ModuleLoader, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import { CorrelationId, Description, Name } from '@serenity-js/core/model';
import { ensure, isDefined } from 'tiny-types';

import { ArtifactWriter } from './ArtifactWriter.js';
import { CIDetector } from './CiDetector.js';
import { DataSnapshotAggregator } from './DataSnapshotAggregator.js';
import type { HtmlReporterConfig } from './HtmlReporterConfig.js';
import { ReportTemplateWriter } from './ReportTemplateWriter.js';
import { RunDataWriter } from './RunDataWriter.js';
import { SceneDataCollector } from './SceneDataCollector.js';
import { SystemContextDetector } from './SystemContextDetector.js';

/**
 * A {@link StageCrewMember} that produces a self-contained static HTML report.
 *
 * ## Registering the HTML Reporter
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 * import { HtmlReporter } from '@serenity-js/html-reporter';
 *
 * configure({
 *   crew: [
 *     HtmlReporter.fromJSON({
 *       outputDirectory: './reports/serenity-js',
 *     }),
 *   ],
 * });
 * ```
 *
 * @group Stage
 */
export class HtmlReporter implements StageCrewMember {

    private readonly eventQueues = new DomainEventQueues();
    private testRunStartedAt: string;
    private testRunnerName = 'unknown';
    private testRunnerVersion = '0.0.0';

    static fromJSON(config: HtmlReporterConfig = {}): StageCrewMemberBuilder<HtmlReporter> {
        return new HtmlReporterBuilder(config);
    }

    constructor(
        private readonly artifactWriter: ArtifactWriter,
        private readonly sceneDataCollector: SceneDataCollector,
        private readonly runDataWriter: RunDataWriter,
        private readonly aggregator: DataSnapshotAggregator,
        private readonly templateWriter: ReportTemplateWriter,
        private readonly systemContextDetector: SystemContextDetector,
        private stage?: Stage,
    ) {
        ensure('artifactWriter', artifactWriter, isDefined());
        ensure('sceneDataCollector', sceneDataCollector, isDefined());
        ensure('runDataWriter', runDataWriter, isDefined());
        ensure('aggregator', aggregator, isDefined());
        ensure('templateWriter', templateWriter, isDefined());
        ensure('systemContextDetector', systemContextDetector, isDefined());
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    notifyOf(event: DomainEvent): void {

        if (event instanceof TestRunStarts) {
            this.testRunStartedAt = event.timestamp.toISOString();
            this.artifactWriter.createRunDirectory(this.testRunStartedAt);
        }

        if (event instanceof TestRunnerDetected) {
            this.testRunnerName = event.name.value;
            this.testRunnerVersion = event.version.toString();
        }

        if (this.isSceneSpecific(event)) {
            this.eventQueues.enqueue(event);
        }

        if (event instanceof ActivityRelatedArtifactGenerated) {
            this.artifactWriter.write(event);
        }

        if (event instanceof ArtifactGenerated && !(event instanceof ActivityRelatedArtifactGenerated)) {
            this.artifactWriter.writeSceneArtifact(event);
        }

        if (event instanceof TestRunFinishes) {
            this.generateReport();
        }
    }

    private generateReport(): void {
        const id = CorrelationId.create();

        this.stage.announce(new AsyncOperationAttempted(
            new Name(this.constructor.name),
            new Description('Generating HTML report...'),
            id,
            this.stage.currentTime(),
        ));

        try {
            // 1. Transform collected events into run data model
            const runData = this.sceneDataCollector.collect(
                this.eventQueues,
                this.testRunStartedAt,
                this.testRunnerName,
                this.testRunnerVersion,
                this.artifactWriter.getArtifactPaths(),
                this.systemContextDetector.detect(),
                this.artifactWriter.getSceneArtifactPaths(),
            );

            // 2. Write db.json for this run
            this.runDataWriter.write(runData, this.artifactWriter.getRunDirectory());

            // 3. Aggregate all historical db.json files into data.js
            this.aggregator.aggregate();

            // 4. Write the report template (index.html)
            this.templateWriter.write();

            this.stage.announce(new AsyncOperationCompleted(
                id,
                this.stage.currentTime(),
            ));
        } catch (error) {
            this.stage.announce(new AsyncOperationFailed(
                error as Error,
                id,
                this.stage.currentTime(),
            ));
        }
    }

    private isSceneSpecific(event: DomainEvent): event is DomainEvent & { sceneId: CorrelationId } {
        return Object.prototype.hasOwnProperty.call(event, 'sceneId');
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

        const artifactWriter = new ArtifactWriter(outputFileSystem);
        const sceneDataCollector = new SceneDataCollector();
        const runDataWriter = new RunDataWriter(outputFileSystem);
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
        const systemContextDetector = new SystemContextDetector(new CIDetector(process.env), new ModuleLoader(process.cwd()), { projectName: this.config.projectName });

        return new HtmlReporter(
            artifactWriter,
            sceneDataCollector,
            runDataWriter,
            aggregator,
            templateWriter,
            systemContextDetector,
            stage,
        );
    }
}
