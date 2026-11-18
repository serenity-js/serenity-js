import type { FullConfig } from '@playwright/test';
import type { FullResult, Reporter, Suite, TestCase, TestError, TestResult, } from '@playwright/test/reporter';
import type { ClassDescription, StageCrewMember, StageCrewMemberBuilder } from '@serenity-js/core';
import { Clock, Duration, Serenity, Timestamp } from '@serenity-js/core';
import type { OutputStream } from '@serenity-js/core/adapter';
import { type DomainEvent, TestRunFinished, TestRunFinishes, TestRunStarts } from '@serenity-js/core/events';
import { type CorrelationId, ExecutionFailedWithError, ExecutionSuccessful, } from '@serenity-js/core/model';

import { WorkerEventStreamer } from '../api/WorkerEventStreamer.js';
import { PlaywrightSceneId } from '../events/index.js';
import { LiveEventsCoordinator } from './LiveEventsCoordinator.js';
import { LiveEventsServer } from './LiveEventsServer.js';
import { PlaywrightErrorParser } from './PlaywrightErrorParser.js';
import { PlaywrightEventBuffer } from './PlaywrightEventBuffer.js';
import { PlaywrightTestSceneIdFactory } from './PlaywrightTestSceneIdFactory.js';

type HookType = 'beforeAll' | 'afterAll' | 'beforeEach' | 'afterEach';

/**
 * Configuration object accepted by `@serenity-js/playwright-test` reporter.
 *
 * For usage examples, see:
 * - [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
 * - [`SerenityWorkerFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
 */
export interface SerenityReporterForPlaywrightTestConfig {
    /**
     * A list of [stage crew member builders](https://serenity-js.org/api/core/interface/StageCrewMemberBuilder/) or [stage crew members](https://serenity-js.org/api/core/interface/StageCrewMember/)
     * to be instantiated in Playwright Test reporter process and notified of [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/) that occur during the scenario execution.
     * Note that the `crew` can also be configured using [class descriptions](https://serenity-js.org/api/core/#ClassDescription).
     *
     * #### Learn more
     * - [`SerenityFixtures`](https://serenity-js.org/api/playwright-test/interface/SerenityFixtures/)
     * - [`SerenityConfig.crew`](https://serenity-js.org/api/core/class/SerenityConfig/#crew)
     */
    crew?: Array<StageCrewMember | StageCrewMemberBuilder | ClassDescription>;

    /**
     * An output stream to be injected into [stage crew member builders](https://serenity-js.org/api/core/interface/StageCrewMemberBuilder/)
     *
     * Defaults to [`process.stdout`](https://nodejs.org/api/process.html#process_process_stdout).
     *
     * #### Learn more
     * - [`SerenityConfig.outputStream`](https://serenity-js.org/api/core/class/SerenityConfig/#outputStream)
     */
    outputStream?: OutputStream;

    /**
     * When enabled, [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/) that occur in Playwright Test worker processes
     * are streamed to the reporter process over a WebSocket connection and announced to the [stage crew members](https://serenity-js.org/api/core/interface/StageCrewMember/)
     * as the scenario executes, rather than when the test is finished.
     *
     * This allows crew members to report progress of long-running scenarios in real time,
     * for example to drive live dashboards or notify external services.
     *
     * Events that can't be delivered live, such as those recorded before a worker crashed,
     * are announced when the test is finished, and each event is announced exactly once.
     *
     * Note that with parallel workers, events from concurrently executing scenarios are announced
     * as they arrive, so crew members receive events from different scenes interleaved
     * and should correlate them by their `sceneId`.
     *
     * Defaults to `false`, in which case all the events for a given scenario are announced together
     * when the test is finished.
     */
    liveEvents?: boolean;
}

/**
 * Serenity/JS reporter that receives notifications from Playwright Test and emits them as
 * Serenity/JS [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/) which can be used by
 * Serenity/JS [stage crew members](https://serenity-js.org/api/core/interface/StageCrewMember/).
 */
export class SerenityReporterForPlaywrightTest implements Reporter {
    private readonly errorParser = new PlaywrightErrorParser();

    private readonly sceneIdFactory: PlaywrightTestSceneIdFactory;
    private readonly serenity: Serenity;
    private unhandledError?: Error;

    private readonly eventBuffer: PlaywrightEventBuffer = new PlaywrightEventBuffer();
    private readonly suiteTestCounts = new Map<Suite, number>();

    private liveEventsServer?: LiveEventsServer;
    private liveEventsCoordinator?: LiveEventsCoordinator;

    /**
     * @param config
     */
    constructor(config: SerenityReporterForPlaywrightTestConfig) {
        this.sceneIdFactory = new PlaywrightTestSceneIdFactory();

        this.serenity = new Serenity(
            new Clock(),
            process.cwd(),
            this.sceneIdFactory,
        )
        this.serenity.configure(config);

        if (config.liveEvents) {
            this.liveEventsCoordinator = new LiveEventsCoordinator(
                (...events) => this.serenity.announce(...events),
            );

            this.liveEventsServer = new LiveEventsServer();
            this.liveEventsServer.onEvent(event => this.liveEventsCoordinator.onStreamedEvent(event));
            this.liveEventsServer.start()
                .then(serverUrl => {
                    process.env[WorkerEventStreamer.environmentVariableName] = serverUrl;
                })
                .catch(error => {
                    console.warn(`[SerenityReporterForPlaywrightTest] Couldn't start the live events server, so events will be announced when each test is finished. ${ error }`);
                    this.liveEventsServer = undefined;
                    this.liveEventsCoordinator = undefined;
                });
        }
    }

    onBegin(config: FullConfig, suite: Suite): void {
        this.eventBuffer.configure(config);
        this.serenity.announce(new TestRunStarts(this.serenity.currentTime()));

        this.countTestsPerSuite(suite);
    }

    private countTestsPerSuite(suite: Suite): void {
        suite.allTests().forEach(test => {
            let currentSuite: Suite | undefined = test.parent;
            while (currentSuite) {
                const count = this.suiteTestCounts.get(currentSuite) ?? 0;
                this.suiteTestCounts.set(currentSuite, count + 1);

                currentSuite = currentSuite.parent;
            }
        });
    }

    onTestBegin(test: TestCase, result: TestResult): void {
        const sceneStartEvents = this.eventBuffer.appendTestStart(test, result);

        this.liveEventsCoordinator?.sceneStarted(this.sceneId(test, result), sceneStartEvents);
    }

    // TODO might be nice to support that by emitting TestStepStarted / Finished
    // onStepBegin(test: TestCase, _result: TestResult, step: TestStep): void {
    //     // console.log('>> onStepBegin');
    // }
    // todo: add stdout -> Log https://github.com/microsoft/playwright/blob/main/packages/playwright/src/reporters/list.ts#L67

    // onStepEnd(test: TestCase, _result: TestResult, step: TestStep): void {
    //     // console.log('>> onStepEnd');
    // }

    onTestEnd(test: TestCase, result: TestResult): void {

        const pendingAfterAllHooks = this.countPendingAfterAllHooks(test);

        if (test.retries > 0) {
            this.eventBuffer.appendRetryableSceneEvents(test, result);
        }

        this.eventBuffer.appendCrashedWorkerEvents(test, result);
        this.eventBuffer.appendSceneEvents(test, result);

        if (pendingAfterAllHooks === 0) {
            this.eventBuffer.appendSceneFinishedEvent(test, result)

            const events = this.eventBuffer.flush(test, result);

            this.serenity.announce(...this.notYetAnnounced(events));

            this.liveEventsCoordinator?.sceneFinished(this.sceneId(test, result));
        }
        else {
            this.eventBuffer.deferAppendingSceneFinishedEvent(test, result);

            this.liveEventsCoordinator?.sceneFinishedButDeferred(this.sceneId(test, result));
        }
    }

    private sceneId(test: TestCase, result: TestResult): CorrelationId {
        return PlaywrightSceneId.from(test.parent.project()?.name, test, result);
    }

    private notYetAnnounced(events: DomainEvent[]): DomainEvent[] {
        return this.liveEventsCoordinator
            ? this.liveEventsCoordinator.notYetAnnounced(events)
            : events;
    }

    private countPendingAfterAllHooks(test: TestCase): number {
        let currentSuite: Suite | undefined = test.parent;
        const pendingAfterAllHooks: Suite[] = [];

        while (currentSuite) {
            const remainingSuites = (this.suiteTestCounts.get(currentSuite) || 0) - 1;
            this.suiteTestCounts.set(currentSuite, remainingSuites);

            if (remainingSuites === 0 && currentSuite['_hooks'].some((hook: { type: HookType }) => hook.type === 'afterAll')) {
                pendingAfterAllHooks.push(currentSuite);
            }

            currentSuite = currentSuite.parent;
        }

        return pendingAfterAllHooks.length;
    }

    onError(error: TestError): void {
        if (!this.unhandledError) {
            this.unhandledError = this.errorParser.errorFrom(error);
        }
    }

    async onEnd(fullResult: FullResult): Promise<void> {

        if (this.liveEventsServer) {
            await this.liveEventsServer.stop();
            delete process.env[WorkerEventStreamer.environmentVariableName];
        }

        const deferredEvents = this.eventBuffer.flushAllDeferred();

        this.serenity.announce(
            ...this.notYetAnnounced(deferredEvents),
        );

        const fullDuration = Duration.ofMilliseconds(Math.round(fullResult.duration));
        const endTime = new Timestamp(fullResult.startTime).plus(fullDuration);

        this.serenity.announce(new TestRunFinishes(endTime));

        try {
            await this.serenity.waitForNextCue();

            const outcome = this.unhandledError
                ? new ExecutionFailedWithError(this.unhandledError)
                : new ExecutionSuccessful();

            this.serenity.announce(
                new TestRunFinished(
                    outcome,
                    endTime,
                ),
            );
        }
        catch (error) {
            this.serenity.announce(
                new TestRunFinished(
                    new ExecutionFailedWithError(error),
                    endTime,
                ),
            );

            throw error;
        }
    }

    // TODO emit a text artifact with stdout
    // reporter.onStdErr(chunk, test, result)
    // reporter.onStdOut(chunk, test, result)

    printsToStdio(): boolean {
        return true;
    }
}
