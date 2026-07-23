import * as path from 'node:path';

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
        private readonly moduleId?: string,
        private readonly attempt: number = 1,
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
            this.ensureRunDirectoryExists();
        }

        if (event instanceof TestRunnerDetected) {
            this.testRunnerName = event.name.value;
            this.testRunnerVersion = event.version.toString();
        }

        if (this.isSceneSpecific(event)) {
            this.eventQueues.enqueue(event);
        }

        if (event instanceof ActivityRelatedArtifactGenerated) {
            this.ensureRunDirectoryExists();
            this.artifactWriter.write(event);
        }

        if (event instanceof ArtifactGenerated && !(event instanceof ActivityRelatedArtifactGenerated)) {
            this.ensureRunDirectoryExists();
            this.artifactWriter.writeSceneArtifact(event);
        }

        if (event instanceof TestRunFinishes) {
            this.ensureRunDirectoryExists();
            this.archiveTestRun();
        }
    }

    private ensureRunDirectoryExists(): void {
        if (this.resolvedTestRunId) {
            return;
        }
        if (!this.testRunTimestamp) {
            this.testRunTimestamp = new Date().toISOString();
        }
        this.resolvedTestRunId = this.testRunId || this.testRunTimestamp.replaceAll(':', '-');
        this.artifactWriter.createRunDirectory(this.resolvedTestRunId, this.attempt, this.moduleId);
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
            const runData = this.sceneDataCollector.collect({
                queues: this.eventQueues,
                testRunStartedAt: this.testRunTimestamp,
                testRunnerName: this.testRunnerName,
                testRunnerVersion: this.testRunnerVersion,
                artifactPaths: this.artifactWriter.getArtifactPaths(),
                systemContext: this.systemContextDetector.detect(),
                sceneArtifactPaths: this.artifactWriter.getSceneArtifactPaths(),
            });

            runData.testRunId = this.resolvedTestRunId;
            runData.attempt = this.artifactWriter.getAttempt();
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
export function detectTestRunId(): string | undefined {
    return process.env.GITHUB_RUN_NUMBER
        || process.env.CI_PIPELINE_IID
        || process.env.BUILD_NUMBER       // Jenkins
        || process.env.CIRCLE_BUILD_NUM   // CircleCI
        || undefined;
}

/**
 * @package
 */
export function detectModuleId(): string | undefined {
    // When a CI testRunId is detected, derive moduleId from the working
    // directory basename. This ensures each parallel CI job writes to its
    // own subdirectory under test-runs/{buildId}/{moduleId}-{attempt}/.
    if (detectTestRunId()) {
        return path.basename(process.cwd());
    }
    return undefined;
}

/**
 * @package
 */
export function detectAttemptNumber(): number {
    if (process.env.GITHUB_RUN_ATTEMPT) {
        return parseInt(process.env.GITHUB_RUN_ATTEMPT, 10) || 1;
    }
    if (process.env.CI_JOB_RETRY) {
        // GitLab: 0-based → convert to 1-based
        return (parseInt(process.env.CI_JOB_RETRY, 10) || 0) + 1;
    }
    if (process.env.BUILD_RETRY_COUNT) {
        // Jenkins: 0-based → convert to 1-based
        return (parseInt(process.env.BUILD_RETRY_COUNT, 10) || 0) + 1;
    }
    return 1;
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

        const attempt = detectAttemptNumber();
        const testRunId = this.config.testRunId || detectTestRunId();
        const moduleId = this.config.moduleId || (this.config.testRunId ? undefined : detectModuleId());

        return new TestRunArchiver(artifactWriter, sceneDataCollector, runDataWriter, systemContextDetector, testRunId, moduleId, attempt, stage);
    }
}
