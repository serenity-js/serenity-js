import type { FullConfig } from '@playwright/test';
import type { FullResult, Reporter, Suite, TestCase, TestError, TestResult, } from '@playwright/test/reporter';
import type { ClassDescription, StageCrewMember, StageCrewMemberBuilder } from '@serenity-js/core';
import { Clock, Duration, Serenity, Timestamp } from '@serenity-js/core';
import type { OutputStream } from '@serenity-js/core/lib/adapter';
import * as events from '@serenity-js/core/lib/events';
import { InteractionFinished, TestRunFinished, TestRunFinishes, TestRunStarts } from '@serenity-js/core/lib/events';
import type { Outcome } from '@serenity-js/core/lib/model';
import { CorrelationId, ExecutionFailedWithError, ExecutionSuccessful, } from '@serenity-js/core/lib/model';

import { SERENITY_JS_DOMAIN_EVENTS_ATTACHMENT_CONTENT_TYPE } from './PlaywrightAttachments';
import { PlaywrightErrorParser } from './PlaywrightErrorParser';
import { PlaywrightEventBuffer } from './PlaywrightEventBuffer';
import { PlaywrightTestSceneIdFactory } from './PlaywrightTestSceneIdFactory';

/**
 * Configuration object accepted by `@serenity-js/playwright-test` reporter.
 *
 * See [`SerenityOptions`](https://serenity-js.org/api/playwright-test/interface/SerenityOptions/) for usage examples.
 */
export interface SerenityReporterForPlaywrightTestConfig {
    /**
     * A list of [stage crew member builders](https://serenity-js.org/api/core/interface/StageCrewMemberBuilder/) or [stage crew members](https://serenity-js.org/api/core/interface/StageCrewMember/)
     * to be instantiated in Playwright Test reporter process and notified of [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/) that occur during the scenario execution.
     * Note that the `crew` can also be configured using [class descriptions](https://serenity-js.org/api/core/#ClassDescription).
     *
     * #### Learn more
     * - [`SerenityOptions`](https://serenity-js.org/api/playwright-test/interface/SerenityOptions/)
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

    /**
     * @param config
     * @param requirementsHierarchy
     *  Root directory of the requirements hierarchy, used to determine capabilities and themes.
     */
    constructor(config: SerenityReporterForPlaywrightTestConfig) {
        this.sceneIdFactory = new PlaywrightTestSceneIdFactory();

        // todo: consider using the constructor to provide the initial config
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
    }

    onTestBegin(test: TestCase, result: TestResult): void {
        this.eventBuffer.recordTestStart(test, result);
    }

    // TODO might be nice to support that by emitting TestStepStarted / Finished
    // onStepBegin(test: TestCase, _result: TestResult, step: TestStep): void {
    //     // console.log('>> onStepBegin');
    // }
    // todo: add stdout -> Log https://github.com/microsoft/playwright/blob/main/packages/playwright/src/reporters/list.ts#L67

    // onStepEnd(test: TestCase, _result: TestResult, step: TestStep): void {
    //     // console.log('>> onStepEnd');
    // }

    // todo:
    //  - this catches events from afterAll hooks
    onTestEnd(test: TestCase, result: TestResult): void {
        // todo: read file
        // ...

        const currentSceneId = new CorrelationId(test.id);

        // TODO: read events from the file instead of the attachment
        let worstInteractionOutcome: Outcome = new ExecutionSuccessful();

        for (const attachment of result.attachments) {
            if (! (attachment.contentType === SERENITY_JS_DOMAIN_EVENTS_ATTACHMENT_CONTENT_TYPE && attachment.body)) {
                continue;
            }

            const messages = JSON.parse(attachment.body.toString());

            for (const message of messages) {
                if (message.value.sceneId === 'unknown') {
                    message.value.sceneId = currentSceneId.value;
                }

                const event = events[message.type].fromJSON(message.value);

                this.eventBuffer.push(currentSceneId, event);

                if (event instanceof InteractionFinished && event.outcome.isWorseThan(worstInteractionOutcome)) {
                    worstInteractionOutcome = event.outcome;
                }
            }
        }

        // todo: if no file, emit the buffered events
        this.eventBuffer.recordTestEnd(test, result, worstInteractionOutcome);

        this.serenity.announce(
            ...this.eventBuffer.flush(test.id)
        );
    }

    onError(error: TestError): void {
        if (!this.unhandledError) {
            this.unhandledError = this.errorParser.errorFrom(error);
        }
    }

    async onEnd(fullResult: FullResult): Promise<void> {

        const endTime = new Timestamp(fullResult.startTime).plus(Duration.ofMilliseconds(Math.round(fullResult.duration)));
        this.serenity.announce(new TestRunFinishes(endTime));

        try {
            await this.serenity.waitForNextCue();

            const outcome = this.unhandledError ?
                new ExecutionFailedWithError(this.unhandledError)
                : new ExecutionSuccessful();

            this.serenity.announce(
                new TestRunFinished(
                    outcome,
                    endTime,
                ),
            );
        } catch (error) {
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
