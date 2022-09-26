import { FullConfig, TestError } from '@playwright/test';
import { Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { LogicError, Serenity, serenity as reporterSerenityInstance, StageCrewMember, StageCrewMemberBuilder, Timestamp } from '@serenity-js/core';
import { OutputStream } from '@serenity-js/core/lib/adapter';
import * as events from '@serenity-js/core/lib/events';
import {
    DomainEvent,
    InteractionFinished,
    RetryableSceneDetected,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
} from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import {
    ArbitraryTag,
    Category,
    CorrelationId,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionRetriedTag,
    ExecutionSkipped,
    ExecutionSuccessful,
    FeatureTag,
    Name,
    Outcome,
    ScenarioDetails,
} from '@serenity-js/core/lib/model';

import { SERENITY_JS_DOMAIN_EVENTS_ATTACHMENT_CONTENT_TYPE } from './PlaywrightAttachments';

// TODO Split SerenityConfig into ActorsConfig and SerenityReportingConfig
export class SerenityReporterForPlaywrightTestConfig {
    /**
     * A list of {@apilink StageCrewMemberBuilder|StageCrewMemberBuilders} or {@apilink StageCrewMember|StageCrewMembers}
     * to be notified of {@apilink DomainEvent|DomainEvents} that occur during the scenario execution.
     */
    crew?: Array<StageCrewMember | StageCrewMemberBuilder>;

    /**
     * An output stream to be injected into {@apilink StageCrewMemberBuilder|StageCrewMemberBuilders}
     *
     * Defaults to [`process.stdout`](https://nodejs.org/api/process.html#process_process_stdout).
     */
    outputStream?: OutputStream;
}

/**
 * Receives notifications from Playwright Test and translates them to Serenity/JS
 * {@apilink DomainEvent|domain events}, so that they can be used with Serenity/JS reporters.
 */
export class SerenityReporterForPlaywrightTest implements Reporter {
    // config!: FullConfig;
    // suite!: Suite;

    private errorParser = new PlaywrightErrorParser();

    private currentSceneId: CorrelationId;

    // TODO use({ actors: ({ context, page, ... }) => Cast)
    //  so that people can override it

    /**
     *
     * @param config
     * @param serenity
     *  Instance of {@apilink Serenity}, specific to the Node process running this Serenity reporter.
     *  Note that Playwright runs test workers and reporters in separate processes.
     */
    constructor(
        config: SerenityReporterForPlaywrightTestConfig,
        private readonly serenity: Serenity = reporterSerenityInstance,
    ) {
        this.serenity.configure(config);
    }

    onBegin(config: FullConfig, suite: Suite): void {
        this.serenity.announce(new TestRunStarts(this.now()));
    }

    onTestBegin(test: TestCase): void {

        this.currentSceneId = this.serenity.assignNewSceneId()

        const scenario = this.scenarioDetailsFrom(test);

        this.emit(
            new SceneStarts(this.currentSceneId, scenario, this.serenity.currentTime()),
            new SceneTagged(this.currentSceneId, new FeatureTag(scenario.category.value), this.serenity.currentTime()),
            new TestRunnerDetected(this.currentSceneId, new Name('Playwright'), this.serenity.currentTime()),
        );
    }

    // TODO might be nice to support that by emitting TestStepStarted / Finished
    // onStepBegin(test: TestCase, _result: TestResult, step: TestStep): void {
    //     // console.log('>> onStepBegin');
    // }

    // onStepEnd(test: TestCase, _result: TestResult, step: TestStep): void {
    //     // console.log('>> onStepEnd');
    // }

    onTestEnd(test: TestCase, result: TestResult): void {

        this.announceRetryIfNeeded(test, result);

        let worstInteractionOutcome: Outcome = new ExecutionSuccessful();

        for (const attachment of result.attachments) {
            if (! (attachment.contentType === SERENITY_JS_DOMAIN_EVENTS_ATTACHMENT_CONTENT_TYPE && attachment.body)) {
                continue;
            }

            const messages = JSON.parse(attachment.body.toString());

            for (const message of messages) {
                if (message.value.sceneId === 'unknown') {
                    message.value.sceneId = this.currentSceneId.value;
                }

                const event = events[message.type].fromJSON(message.value);

                this.serenity.announce(event);

                if (event instanceof InteractionFinished && event.outcome.isWorseThan(worstInteractionOutcome)) {
                    worstInteractionOutcome = event.outcome;
                }
            }
        }

        const scenarioOutcome = this.outcomeFrom(test, result);

        this.serenity.announce(
            new SceneFinished(
                this.currentSceneId,
                this.scenarioDetailsFrom(test),
                this.determineScenarioOutcome(worstInteractionOutcome, scenarioOutcome),
                this.now(),
            )
        );
    }

    private determineScenarioOutcome(worstInteractionOutcome: Outcome, scenarioOutcome: Outcome): Outcome {
        if (worstInteractionOutcome instanceof ExecutionFailedWithAssertionError) {
            return worstInteractionOutcome;
        }

        return worstInteractionOutcome.isWorseThan(scenarioOutcome)
            ? worstInteractionOutcome
            : scenarioOutcome;
    }

    private outcomeFrom(test: TestCase, result: TestResult): Outcome {

        const outcome = test.outcome();

        if (outcome === 'skipped') {
            return new ExecutionSkipped();
        }

        if (outcome === 'unexpected' && result.status === 'passed') {
            return new ExecutionFailedWithError(new LogicError(`Scenario expected to fail, but ${ result.status }`));
        }

        if (['failed', 'interrupted', 'timedOut'].includes(result.status)) {

            if (test.retries > result.retry) {
                return new ExecutionIgnored(this.errorParser.errorFrom(result.error));
            }

            return new ExecutionFailedWithError(this.errorParser.errorFrom(result.error));
        }

        return new ExecutionSuccessful();
    }

    private scenarioDetailsFrom(test: TestCase) {
        const [ root_, browserName_, fileName_, featureName, ...scenarioTitle] = test.titlePath();

        return new ScenarioDetails(
            new Name(scenarioTitle.join(' ')),
            new Category(featureName),
            new FileSystemLocation(
                new Path(test.location.file),
                test.location.line,
                test.location.column,
            ),
        );
    }

    async onEnd(): Promise<void> {
        this.serenity.announce(new TestRunFinishes(this.serenity.currentTime()));

        await this.serenity.waitForNextCue();

        this.serenity.announce(new TestRunFinished(this.serenity.currentTime()));
    }

    // TODO emit a text artifact with stdout?
    // reporter.onStdErr(chunk, test, result)
    // reporter.onStdOut(chunk, test, result)

    private emit(...events: DomainEvent[]): void {
        events.forEach(event => {
            this.serenity.announce(event)
        });
    }

    private announceRetryIfNeeded(test: TestCase, result: TestResult): void {
        if (test.retries === 0) {
            return;
        }

        this.emit(
            new RetryableSceneDetected(
                this.currentSceneId,
                this.now(),
            ),
            new SceneTagged(
                this.currentSceneId,
                new ArbitraryTag('retried'),        // todo: replace with a dedicated tag
                this.now(),
            ),
        );

        if (result.retry > 0) {
            this.emit(
                new SceneTagged(
                    this.currentSceneId,
                    new ExecutionRetriedTag(result.retry),
                    this.serenity.currentTime(),
                ),
            );
        }
    }

    private now(): Timestamp {
        return this.serenity.currentTime();
    }

    printsToStdio(): boolean {
        return true;
    }
}

class PlaywrightErrorParser {
    private static ascii = new RegExp(
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))', // eslint-disable-line no-control-regex
        'g',
    );

    public errorFrom(testError: TestError): Error {

        const message = testError.message && PlaywrightErrorParser.stripAsciiFrom(testError.message);
        let stack = testError.stack && PlaywrightErrorParser.stripAsciiFrom(testError.stack);

        // TODO: Do I need to process it?
        // const value     = testError.value;

        const prologue = `Error: ${message}`;
        if (stack && message && stack.startsWith(prologue)) {
            stack = stack.slice(prologue.length);
        }

        const error = new Error(message);
        error.stack = stack;

        return error;
    }

    private static stripAsciiFrom(text: string): string {
        return text.replace(this.ascii, '');
    }
}
