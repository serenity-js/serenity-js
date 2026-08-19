import type {
    Stage,
    StageCrewMember,
    StageCrewMemberBuilder,
    StageCrewMemberBuilderDependencies
} from '@serenity-js/core';
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

import type { HtmlReporterConfig } from '../HtmlReporterConfig.js';
import type { RunData } from '../model/RunData.js';
import { CURRENT_RUN_DATA_SCHEMA_VERSION } from '../model/RunData.js';
import { ArtifactWriter } from './ArtifactWriter.js';
import type { ExecutionContext } from './ExecutionContext.js';
import { AutoDiscoveredExecutionContext } from './ExecutionContext.js';
import { RunDataWriter } from './RunDataWriter.js';
import { SceneDataCollector } from './SceneDataCollector.js';
import { SystemContextDetector } from './SystemContextDetector.js';

/**
 * A [`StageCrewMember`](https://serenity-js.org/api/core/interface/StageCrewMember/) that archives
 * test run data (`db.json`) and screenshot artifacts to disk during the test run.
 *
 * Unlike {@link HtmlReporter}, this crew member does **not** generate the aggregated HTML report.
 * It only persists the raw data. Use it in CI pipelines where each parallel job archives its
 * own data, and a separate aggregation step (via {@link HtmlReportGenerator} or the CLI) combines
 * all data into a single report.
 *
 * ## When to use `TestRunArchiver` instead of `HtmlReporter`
 *
 * Use {@link HtmlReporter} (the default) when you want a single crew member to handle
 * both data collection and report generation in the same process.
 *
 * Use `TestRunArchiver` when:
 * - Tests run in parallel across multiple CI jobs or containers
 * - Report generation should happen after all test jobs complete
 * - You need to aggregate results from multiple shards into one report
 *
 * ## Split workflow for parallel CI jobs
 *
 * **Step 1:** Register `TestRunArchiver` in each parallel CI job:
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 *
 * configure({
 *   crew: [
 *     ['@serenity-js/html-reporter:TestRunArchiver', {
 *       outputDirectory: './reports/serenity-js',
 *       testRunId: process.env.BUILD_NUMBER,
 *       moduleId: 'api-tests',
 *     }],
 *   ],
 * });
 * ```
 *
 * **Step 2:** After all jobs finish, aggregate and generate the report:
 *
 * ```sh
 * npx @serenity-js/html-reporter aggregate \
 *   --input "./reports/serenity-js/test-runs/**" \
 *   --output ./reports/serenity-js \
 *   --spec-dir ./spec
 * ```
 *
 * ## Registering with Playwright Test
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
 *         ['@serenity-js/html-reporter:TestRunArchiver', {
 *           outputDirectory: './reports/serenity-js',
 *           testRunId: process.env.GITHUB_RUN_NUMBER,
 *           moduleId: 'e2e-chrome',
 *         }],
 *       ],
 *     }],
 *   ],
 * });
 * ```
 *
 * ## Registering with WebdriverIO
 *
 * ```ts
 * // wdio.conf.ts
 * import type { WebdriverIOConfig } from '@serenity-js/webdriverio';
 *
 * export const config: WebdriverIOConfig = {
 *   framework: '@serenity-js/webdriverio',
 *   serenity: {
 *     crew: [
 *       ['@serenity-js/html-reporter:TestRunArchiver', {
 *         outputDirectory: './reports/serenity-js',
 *         testRunId: process.env.BUILD_NUMBER,
 *         moduleId: 'wdio-chrome',
 *       }],
 *     ],
 *   },
 * };
 * ```
 *
 * ## Programmatic registration with `fromJSON`
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 * import { TestRunArchiver } from '@serenity-js/html-reporter';
 *
 * configure({
 *   crew: [
 *     TestRunArchiver.fromJSON({
 *       outputDirectory: './reports/serenity-js',
 *       testRunId: process.env.BUILD_NUMBER,
 *       moduleId: 'api-tests',
 *     }),
 *   ],
 * });
 * ```
 *
 * ## Learn more
 *
 * - {@link HtmlReporter} — all-in-one crew member (collection + generation)
 * - {@link HtmlReportGenerator} — report generation only
 * - {@link HtmlReporterConfig} — configuration options
 * - [CI Integration Guide](https://serenity-js.org/handbook/reporting/html-reporter/#ci-integration)
 *
 * @group Stage
 */
export class TestRunArchiver implements StageCrewMember {

    private readonly eventQueues = new DomainEventQueues();
    private resolvedTestRunId: string;
    private testRunTimestamp: string;
    private testRunnerName = 'unknown';
    private testRunnerVersion = '0.0.0';

    private readonly artifactWriter: ArtifactWriter;
    private readonly sceneDataCollector: SceneDataCollector;
    private readonly runDataWriter: RunDataWriter;
    private readonly systemContextDetector: SystemContextDetector;

    /**
     * Creates a {@link StageCrewMemberBuilder} that will instantiate the `TestRunArchiver`
     * with the provided {@link HtmlReporterConfig}.
     *
     * @param config
     *  Configuration options for the archiver. All properties are optional.
     */
    static fromJSON(config: HtmlReporterConfig = {}): StageCrewMemberBuilder<TestRunArchiver> {
        return new TestRunArchiverBuilder(config);
    }

    /**
     * @param outputFileSystem
     *  File system rooted at the configured output directory
     * @param executionContext
     *  Detected CI execution context (test run ID, module ID, attempt, runtime metadata)
     * @param moduleLoader
     *  Module loader for resolving package versions and project metadata
     * @param stage
     *  Stage instance (set automatically via {@link assignedTo} when used as a crew member)
     */
    constructor(
        outputFileSystem: FileSystem,
        private readonly executionContext: ExecutionContext,
        moduleLoader: ModuleLoader,
        private stage?: Stage,
    ) {
        ensure('outputFileSystem', outputFileSystem, isDefined());
        ensure('executionContext', executionContext, isDefined());
        ensure('moduleLoader', moduleLoader, isDefined());

        this.artifactWriter = new ArtifactWriter(outputFileSystem);
        this.sceneDataCollector = new SceneDataCollector();
        this.runDataWriter = new RunDataWriter(outputFileSystem, executionContext.workerId);
        this.systemContextDetector = new SystemContextDetector(executionContext, moduleLoader);
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
    }

    notifyOf(event: DomainEvent): void {

        if (event instanceof TestRunStarts) {
            this.testRunTimestamp = event.timestamp.toISOString();
            this.ensureRunDirectoryExists();
            this.writePlaceholder();
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

        if (event instanceof ArtifactGenerated && ! (event instanceof ActivityRelatedArtifactGenerated)) {
            this.ensureRunDirectoryExists();
            this.artifactWriter.writeSceneArtifact(event);
        }

        if (event instanceof TestRunFinishes) {
            this.ensureRunDirectoryExists();
            this.archiveTestRun();
        }
    }

    private writePlaceholder(): void {
        const placeholder: RunData = {
            schemaVersion: CURRENT_RUN_DATA_SCHEMA_VERSION,
            startedAt: this.testRunTimestamp,
            outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
            scenes: [],
            tags: [],
            systemContext: this.systemContextDetector.detect(),
        };

        if (this.resolvedTestRunId) {
            placeholder.testRunId = this.resolvedTestRunId;
        }
        if (this.executionContext.moduleId) {
            placeholder.moduleId = this.executionContext.moduleId;
        }
        if (this.executionContext.attempt) {
            placeholder.attempt = this.executionContext.attempt;
        }

        this.runDataWriter.write(placeholder, this.artifactWriter.getRunDirectory());
    }

    private ensureRunDirectoryExists(): void {
        if (this.resolvedTestRunId) {
            return;
        }
        if (! this.testRunTimestamp) {
            this.testRunTimestamp = new Date().toISOString();
        }
        this.resolvedTestRunId = this.executionContext.testRunId || this.deriveTestRunIdFromTimestamp();
        this.artifactWriter.createRunDirectory(this.resolvedTestRunId, this.executionContext.attempt, this.executionContext.moduleId);
    }

    /**
     * Derives a testRunId from the test run timestamp. When running as a WebdriverIO
     * parallel worker (WDIO_WORKER_ID is set), truncates to second precision so that
     * all workers spawned within the same second share the same run directory.
     */
    private deriveTestRunIdFromTimestamp(): string {
        const timestamp = this.executionContext.workerId
            ? this.testRunTimestamp.replace(/\.\d{3}Z$/, '.000Z')
            : this.testRunTimestamp;

        return timestamp.replaceAll(':', '-');
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
                moduleId: this.executionContext.moduleId,
            });

            runData.testRunId = this.resolvedTestRunId;
            runData.moduleId = this.executionContext.moduleId;
            runData.attempt = this.artifactWriter.getAttempt();
            this.runDataWriter.write(runData, this.artifactWriter.getRunDirectory());

            this.stage.announce(new AsyncOperationCompleted(
                id,
                this.stage.currentTime(),
            ));
        }
        catch (error) {
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
 * @internal
 */
class TestRunArchiverBuilder implements StageCrewMemberBuilder<TestRunArchiver> {

    constructor(private readonly config: HtmlReporterConfig) {
    }

    build({ stage }: StageCrewMemberBuilderDependencies): TestRunArchiver {
        ensure('stage', stage, isDefined());

        const outputDirectory = Path.from(this.config.outputDirectory || './reports/serenity-js');
        const outputFileSystem = new FileSystem(outputDirectory);

        const executionContext = new AutoDiscoveredExecutionContext({
            testRunId: this.config.testRunId,
            moduleId: this.config.moduleId,
            projectName: this.config.projectName,
            ci: this.config.ci
        });

        return new TestRunArchiver(outputFileSystem, executionContext, new ModuleLoader(process.cwd()), stage);
    }
}
