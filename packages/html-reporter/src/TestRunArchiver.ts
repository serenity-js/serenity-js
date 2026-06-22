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
import { FileSystem, ModuleLoader, Path } from '@serenity-js/core/io';
import { CorrelationId, Description, Name } from '@serenity-js/core/model';
import { ensure, isDefined } from 'tiny-types';

import { ArtifactWriter } from './ArtifactWriter.js';
import { CIDetector } from './CiDetector.js';
import type { HtmlReporterConfig } from './HtmlReporterConfig.js';
import { RunDataWriter } from './RunDataWriter.js';
import { SceneDataCollector } from './SceneDataCollector.js';
import { SystemContextDetector } from './SystemContextDetector.js';

/**
 * A {@link StageCrewMember} that archives test run data (db.json + artifacts)
 * without generating the aggregated HTML report.
 *
 * Use this in CI pipelines where report generation is deferred to a separate step.
 *
 * ## Usage
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 *
 * configure({
 *   crew: [
 *     '@serenity-js/html-reporter:TestRunArchiver',
 *   ],
 * });
 * ```
 *
 * @group Stage
 */
export class TestRunArchiver implements StageCrewMember {

    private readonly eventQueues = new DomainEventQueues();
    private resolvedTestRunId: string;
    private testRunTimestamp: string;
    private testRunnerName = 'unknown';
    private testRunnerVersion = '0.0.0';

    static fromJSON(config: HtmlReporterConfig = {}): StageCrewMemberBuilder<TestRunArchiver> {
        return new TestRunArchiverBuilder(config);
    }

    constructor(
        private readonly artifactWriter: ArtifactWriter,
        private readonly sceneDataCollector: SceneDataCollector,
        private readonly runDataWriter: RunDataWriter,
        private readonly systemContextDetector: SystemContextDetector,
        private readonly testRunId?: string,
        private stage?: Stage,
    ) {
        ensure('artifactWriter', artifactWriter, isDefined());
        ensure('sceneDataCollector', sceneDataCollector, isDefined());
        ensure('runDataWriter', runDataWriter, isDefined());
        ensure('systemContextDetector', systemContextDetector, isDefined());
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    notifyOf(event: DomainEvent): void {

        if (event instanceof TestRunStarts) {
            this.testRunTimestamp = event.timestamp.toISOString();
            this.resolvedTestRunId = this.testRunId || detectTestRunId() || this.testRunTimestamp;
            this.artifactWriter.createRunDirectory(this.resolvedTestRunId);
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
            this.archiveTestRun();
        }
    }

    private archiveTestRun(): void {
        const id = CorrelationId.create();

        this.stage.announce(new AsyncOperationAttempted(
            new Name(this.constructor.name),
            new Description('Archiving test run data...'),
            id,
            this.stage.currentTime(),
        ));

        try {
            const runData = this.sceneDataCollector.collect(
                this.eventQueues,
                this.testRunTimestamp,
                this.testRunnerName,
                this.testRunnerVersion,
                this.artifactWriter.getArtifactPaths(),
                this.systemContextDetector.detect(),
                this.artifactWriter.getSceneArtifactPaths(),
            );

            runData.testRunId = this.resolvedTestRunId;
            this.runDataWriter.write(runData, this.artifactWriter.getRunDirectory());

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
function detectTestRunId(): string | undefined {
    return process.env.GITHUB_RUN_NUMBER
        || process.env.CI_PIPELINE_IID
        || process.env.BUILD_NUMBER       // Jenkins
        || process.env.CIRCLE_BUILD_NUM   // CircleCI
        || undefined;
}

/**
 * @package
 */
class TestRunArchiverBuilder implements StageCrewMemberBuilder<TestRunArchiver> {

    constructor(private readonly config: HtmlReporterConfig) {
    }

    build({ stage }: StageCrewMemberBuilderDependencies): TestRunArchiver {
        ensure('stage', stage, isDefined());

        const outputDirectory = Path.from(this.config.outputDirectory || './reports/serenity-js');
        const outputFileSystem = new FileSystem(outputDirectory);

        const artifactWriter = new ArtifactWriter(outputFileSystem);
        const sceneDataCollector = new SceneDataCollector();
        const runDataWriter = new RunDataWriter(outputFileSystem);
        const systemContextDetector = new SystemContextDetector(new CIDetector(process.env), new ModuleLoader(process.cwd()), { projectName: this.config.projectName, runtime: this.config.ci });

        return new TestRunArchiver(artifactWriter, sceneDataCollector, runDataWriter, systemContextDetector, this.config.testRunId, stage);
    }
}
