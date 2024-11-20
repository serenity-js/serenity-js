import type { FullConfig } from '@playwright/test';
import type { Reporter, Suite, TestCase, TestError, TestResult, } from '@playwright/test/reporter';
import type {
    ClassDescription,
    Serenity,
    StageCrewMember,
    StageCrewMemberBuilder,
    Timestamp,
} from '@serenity-js/core';
import { LogicError, serenity as reporterSerenityInstance, } from '@serenity-js/core';
import type { OutputStream } from '@serenity-js/core/lib/adapter';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import * as events from '@serenity-js/core/lib/events';
import {
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
import { FileSystem, FileSystemLocation, Path, RequirementsHierarchy, } from '@serenity-js/core/lib/io';
import type { CorrelationId, Outcome, Tag } from '@serenity-js/core/lib/model';
import {
    ArbitraryTag,
    Category,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionRetriedTag,
    ExecutionSkipped,
    ExecutionSuccessful,
    Name,
    ScenarioDetails,
    Tags,
} from '@serenity-js/core/lib/model';

import { SERENITY_JS_DOMAIN_EVENTS_ATTACHMENT_CONTENT_TYPE } from './PlaywrightAttachments';

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
    private errorParser = new PlaywrightErrorParser();
    private sceneIds: Map<string, CorrelationId> = new Map();
    private unhandledError?: Error;

    /**
     * @param config
     * @param serenity
     *  Instance of [`Serenity`](https://serenity-js.org/api/core/class/Serenity/), specific to the Node process running this Serenity reporter.
     *  Note that Playwright runs test workers and reporters in separate processes.
     * @param requirementsHierarchy
     *  Root directory of the requirements hierarchy, used to determine capabilities and themes.
     */
    constructor(
        config: SerenityReporterForPlaywrightTestConfig,
        private readonly serenity: Serenity = reporterSerenityInstance,
        private requirementsHierarchy: RequirementsHierarchy = new RequirementsHierarchy(
            new FileSystem(Path.from(process.cwd())),
        ),
    ) {
        this.serenity.configure(config);
    }

    onBegin(config: FullConfig, suite: Suite): void {
        this.requirementsHierarchy = new RequirementsHierarchy(
            new FileSystem(Path.from(config.rootDir)),
        );

        this.serenity.announce(new TestRunStarts(this.now()));
    }

    onTestBegin(test: TestCase): void {
        const currentSceneId = this.serenity.assignNewSceneId();

        this.sceneIds.set(test.id, currentSceneId);

        const { scenarioDetails, scenarioTags } = this.scenarioDetailsFrom(test);

        const tags: Tag[] = [
            ... scenarioTags,
            ... test.tags.flatMap(tag => Tags.from(tag)),
        ];

        this.emit(
            new SceneStarts(currentSceneId, scenarioDetails, this.serenity.currentTime()),

            ...this.requirementsHierarchy
                .requirementTagsFor(scenarioDetails.location.path, scenarioDetails.category.value)
                .map(tag => new SceneTagged(currentSceneId, tag, this.serenity.currentTime())),

            new TestRunnerDetected(
                currentSceneId,
                new Name('Playwright'),
                this.serenity.currentTime(),
            ),

            ...tags.map(tag => new SceneTagged(currentSceneId, tag, this.serenity.currentTime())),
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
                this.scenarioDetailsFrom(test).scenarioDetails,
                this.determineScenarioOutcome(worstInteractionOutcome, scenarioOutcome),
                this.now(),
            ),
        );
    }

    onError(error: TestError): void {
        if (!this.unhandledError) {
            this.unhandledError = this.errorParser.errorFrom(error);
        }
    }

    private determineScenarioOutcome(
        worstInteractionOutcome: Outcome,
        scenarioOutcome: Outcome,
    ): Outcome {
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
            return new ExecutionFailedWithError(
                new LogicError(`Scenario expected to fail, but ${ result.status }`),
            );
        }

        if ([ 'failed', 'interrupted', 'timedOut' ].includes(result.status)) {
            if (test.retries > result.retry) {
                return new ExecutionIgnored(this.errorParser.errorFrom(result.error));
            }

            return new ExecutionFailedWithError(
                this.errorParser.errorFrom(result.error),
            );
        }

        return new ExecutionSuccessful();
    }

    private scenarioDetailsFrom(test: TestCase): { scenarioDetails: ScenarioDetails, scenarioTags: Tag[] } {
        const [
            root_,
            browserName_,
            fileName,
            describeOrItBlockTitle,
            ...nestedTitles
        ] = test.titlePath();

        const path = new Path(test.location.file);
        const scenarioName = nestedTitles.join(' ').trim();

        const name = scenarioName || describeOrItBlockTitle;
        const featureName = scenarioName ? describeOrItBlockTitle : fileName;

        return {
            scenarioDetails: new ScenarioDetails(
                new Name(Tags.stripFrom(name)),
                new Category(Tags.stripFrom(featureName)),
                new FileSystemLocation(path, test.location.line, test.location.column),
            ),
            scenarioTags: Tags.from(`${ featureName } ${ name }`),
        };
    }

    async onEnd(): Promise<void> {
        this.serenity.announce(new TestRunFinishes(this.serenity.currentTime()));

        try {
            await this.serenity.waitForNextCue();

            const outcome = this.unhandledError ?
                new ExecutionFailedWithError(this.unhandledError)
                : new ExecutionSuccessful();

            this.serenity.announce(
                new TestRunFinished(
                    outcome,
                    this.serenity.currentTime(),
                ),
            );
        } catch (error) {
            this.serenity.announce(
                new TestRunFinished(
                    new ExecutionFailedWithError(error),
                    this.serenity.currentTime(),
                ),
            );
            throw error;
        }
    }

    // TODO emit a text artifact with stdout?
    // reporter.onStdErr(chunk, test, result)
    // reporter.onStdOut(chunk, test, result)

    private emit(...events: DomainEvent[]): void {
        events.forEach((event) => {
            this.serenity.announce(event);
        });
    }

    private announceRetryIfNeeded(test: TestCase, result: TestResult): void {
        if (test.retries === 0) {
            return;
        }

        const currentSceneId = this.sceneIds.get(test.id);

        this.emit(
            new RetryableSceneDetected(currentSceneId, this.now()),
            new SceneTagged(
                currentSceneId,
                new ArbitraryTag('retried'), // todo: replace with a dedicated tag
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

        const prologue = `Error: ${ message }`;
        if (stack && message && stack.startsWith(prologue)) {
            stack = stack.slice(prologue.length);
        }

        if (testError.cause) {
            stack += `\nCaused by: ${ this.errorFrom(testError.cause).stack }`;
        }

        const error = new Error(message);
        error.stack = stack;

        return error;
    }

    private static stripAsciiFrom(text: string): string {
        return text.replace(this.ascii, '');
    }
}
