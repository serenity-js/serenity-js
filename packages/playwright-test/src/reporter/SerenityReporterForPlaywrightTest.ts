import type { FullConfig } from '@playwright/test';
import type { Reporter, Suite, TestCase, TestError, TestResult } from '@playwright/test/reporter';
import {
    ClassDescription,
    LogicError,
    Serenity,
    serenity as reporterSerenityInstance,
    StageCrewMember,
    StageCrewMemberBuilder,
    Timestamp
} from '@serenity-js/core';
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
    TestRunStarts
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

/**
 * Configuration object accepted by `@serenity-js/playwright-test` reporter.
 *
 * See {@apilink SerenityOptions} for usage examples.
 */
export interface SerenityReporterForPlaywrightTestConfig {

    /**
     * A list of {@apilink StageCrewMemberBuilder|StageCrewMemberBuilders} or {@apilink StageCrewMember|StageCrewMembers}
     * to be instantiated in Playwright Test reporter process and notified of {@apilink DomainEvent|DomainEvents} that occur during the scenario execution.
     * Note that the `crew` can also be configured using {@apilink ClassDescription|ClassDescriptions}.
     *
     * #### Learn more
     * - {@apilink SerenityOptions}
     * - {@apilink SerenityConfig.crew}
     */
    crew?: Array<StageCrewMember | StageCrewMemberBuilder | ClassDescription>;

    /**
     * An output stream to be injected into {@apilink StageCrewMemberBuilder|StageCrewMemberBuilders}
     *
     * Defaults to [`process.stdout`](https://nodejs.org/api/process.html#process_process_stdout).
     *
     * #### Learn more
     * - {@apilink SerenityConfig.outputStream}
     */
    outputStream?: OutputStream;
}

/**
 * Serenity/JS reporter that receives notifications from Playwright Test and emits them as
 * Serenity/JS {@apilink DomainEvent|domain events} which can be used by
 * Serenity/JS {@apilink StageCrewMember|stage crew members}.
 */
export class SerenityReporterForPlaywrightTest implements Reporter {

    private errorParser = new PlaywrightErrorParser();
    private sceneIds: Map<string, CorrelationId> = new Map();

    /**
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

        const currentSceneId = this.serenity.assignNewSceneId();

        this.sceneIds.set(test.id, currentSceneId);

        const scenario = this.scenarioDetailsFrom(test);

        this.emit(
            new SceneStarts(currentSceneId, scenario, this.serenity.currentTime()),
            new SceneTagged(currentSceneId, new FeatureTag(scenario.category.value), this.serenity.currentTime()),
            new TestRunnerDetected(currentSceneId, new Name('Playwright'), this.serenity.currentTime()),
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

        const currentSceneId = this.sceneIds.get(test.id);

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

                this.serenity.announce(event);

                if (event instanceof InteractionFinished && event.outcome.isWorseThan(worstInteractionOutcome)) {
                    worstInteractionOutcome = event.outcome;
                }
            }
        }

        const scenarioOutcome = this.outcomeFrom(test, result);

        this.serenity.announce(
            new SceneFinished(
                currentSceneId,
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
        const [ root_, browserName_, fileName, describeOrItBlockTitle, ...nestedTitles] = test.titlePath();

        const path = new Path(test.location.file);
        const scenarioName = nestedTitles.join(' ').trim();

        const featureName = scenarioName
            ? describeOrItBlockTitle
            : fileName;

        return new ScenarioDetails(
            new Name(scenarioName || describeOrItBlockTitle),
            new Category(featureName),
            new FileSystemLocation(
                path,
                test.location.line,
                test.location.column,
            ),
        );
    }

    async onEnd(): Promise<void> {
        this.serenity.announce(new TestRunFinishes(this.serenity.currentTime()));

        try {
            await this.serenity.waitForNextCue();
            this.serenity.announce(new TestRunFinished(new ExecutionSuccessful(), this.serenity.currentTime()));
        }
        catch (error) {
            this.serenity.announce(new TestRunFinished(new ExecutionFailedWithError(error), this.serenity.currentTime()));
            throw error;
        }
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

        const currentSceneId = this.sceneIds.get(test.id);

        this.emit(
            new RetryableSceneDetected(
                currentSceneId,
                this.now(),
            ),
            new SceneTagged(
                currentSceneId,
                new ArbitraryTag('retried'),        // todo: replace with a dedicated tag
                this.now(),
            ),
        );

        if (result.retry > 0) {
            this.emit(
                new SceneTagged(
                    currentSceneId,
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
