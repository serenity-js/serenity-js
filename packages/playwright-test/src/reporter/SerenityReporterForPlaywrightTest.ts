import type { FullConfig } from '@playwright/test';
import type { FullResult, Reporter, Suite, TestCase, TestError, TestResult, } from '@playwright/test/reporter';
import type { ClassDescription, StageCrewMember, StageCrewMemberBuilder } from '@serenity-js/core';
import { Clock, Duration, Serenity, Timestamp } from '@serenity-js/core';
import type { OutputStream } from '@serenity-js/core/lib/adapter';
import { TestRunFinished, TestRunFinishes, TestRunStarts } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithError, ExecutionSuccessful, } from '@serenity-js/core/lib/model';

import { PlaywrightErrorParser } from './PlaywrightErrorParser';
import { PlaywrightEventBuffer } from './PlaywrightEventBuffer';
import { PlaywrightTestSceneIdFactory } from './PlaywrightTestSceneIdFactory';

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
        this.eventBuffer.appendTestStart(test, result);
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

            this.serenity.announce(...events);
        }
        else {
            this.eventBuffer.deferAppendingSceneFinishedEvent(test, result);
        }
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

        const deferredEvents = this.eventBuffer.flushAllDeferred();

        this.serenity.announce(
            ...deferredEvents,
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
