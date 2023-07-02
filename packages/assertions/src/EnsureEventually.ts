import {
    Answerable,
    AnswersQuestions,
    AssertionError,
    CollectsArtifacts,
    d,
    Duration,
    Expectation,
    ExpectationMet,
    ExpectationOutcome,
    Interaction,
    ListItemNotFoundError,
    RaiseErrors,
    RuntimeError,
    ScheduleWork,
    TimeoutExpiredError,
    UsesAbilities,
} from '@serenity-js/core';
import { FileSystemLocation } from '@serenity-js/core/lib/io';

/**
 * The {@apilink Interaction|interaction} to `EnsureEventually`
 * verifies if the resolved value of the provided {@apilink Answerable}
 * meets the specified {@apilink Expectation} within the expected timeframe.
 *
 * If the expectation is not met by the time the timeout expires, the interaction throws an {@apilink AssertionError}.
 * `EnsureEventually` retries the evaluation if resolving the `actual` results in an {@apilink ListItemNotFoundError},
 * but rethrows any other errors.
 *
 * :::tip Use the factory method
 * Use the factory method {@apilink Ensure.eventually} to instantiate this interaction.
 * :::
 *
 * ## Basic usage with dynamic values
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { Text, PageElement, By } from '@serenity-js/web'
 *
 * await actorCalled('Erica').attemptsTo(
 *   Ensure.eventually(
 *     Text.of(PageElement.located(By.css('h1'))),
 *     equals('Learn Serenity/JS!')
 *   )
 * )
 * ```
 *
 * ## Composing expectations with `and`
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { and, Ensure, startsWith, endsWith } from '@serenity-js/assertions'
 * import { Text, PageElement, By } from '@serenity-js/web'
 *
 * await actorCalled('Erica').attemptsTo(
 *   Ensure.eventually(
 *     Text.of(PageElement.located(By.css('h1'))),
 *     and(startsWith('Serenity'), endsWith('!'))
 *   )
 * )
 * ```
 *
 * ## Overriding the type of Error thrown upon assertion failure
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { and, Ensure, startsWith, endsWith } from '@serenity-js/assertions'
 * import { Text, PageElement, By } from '@serenity-js/web'
 *
 * await actorCalled('Erica').attemptsTo(
 *   Ensure.eventually(
 *     Text.of(PageElement.located(By.css('h1'))),
 *     and(startsWith('Serenity'), endsWith('!'))
 *   ).otherwiseFailWith(LogicError, `Looks like we're not on the right page`)
 * )
 * ```
 *
 * @experimental
 *
 * @group Activities
 */
export class EnsureEventually<Actual> extends Interaction {
    /**
     * @param actual
     * @param expectation
     * @param location
     * @param timeout
     */
    constructor(
        protected readonly actual: Answerable<Actual>,
        protected readonly expectation: Expectation<Actual>,
        location: FileSystemLocation,
        protected readonly timeout?: Duration,
    ) {
        super(d`#actor ensures that ${ actual } does eventually ${ expectation }`, location);
    }

    /**
     * Override the default timeout set via {@apilink SerenityConfig.interactionTimeout}.
     *
     * @param timeout
     */
    timeoutAfter(timeout: Duration): EnsureEventually<Actual> {
        return new EnsureEventually<Actual>(this.actual, this.expectation, this.instantiationLocation(), timeout);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): Promise<void> {
        await ScheduleWork.as(actor).repeatUntil<ExpectationOutcome>(
            () => actor.answer(this.expectation.isMetFor(this.actual)),
            {
                exitCondition: outcome =>
                    outcome instanceof ExpectationMet,

                delayBetweenInvocations: (invocation) => invocation === 0
                    ? Duration.ofMilliseconds(0)                        // perform the first evaluation straight away
                    : Duration.ofMilliseconds(2 ** invocation * 100),   // use simple exponential backoff strategy for subsequent calls

                timeout: this.timeout,

                errorHandler: (error, outcome) => {
                    if (error instanceof ListItemNotFoundError) {
                        return; // ignore, lists might get populated later
                    }

                    if (error instanceof TimeoutExpiredError) {

                        const actualDescription = d`${ this.actual }`;
                        const message = outcome ? `Expected ${ actualDescription } to eventually ${ outcome?.message }` : error.message;

                        throw RaiseErrors.as(actor).create(AssertionError, {
                            message,
                            expectation: outcome?.expectation,
                            diff: outcome && { expected: outcome?.expected, actual: outcome?.actual },
                            location: this.instantiationLocation(),
                            cause: error,
                        });
                    }

                    throw error;
                },
            },
        );
    }

    /**
     * Overrides the default {@apilink AssertionError} thrown when
     * the actual value does not meet the expectation.
     *
     * @param typeOfRuntimeError
     *  A constructor function producing a subtype of {@apilink RuntimeError} to throw, e.g. {@apilink TestCompromisedError}
     *
     * @param message
     *  The message explaining the failure
     */
    otherwiseFailWith(typeOfRuntimeError: new (message: string, cause?: Error) => RuntimeError, message?: string): Interaction {
        const location = this.instantiationLocation();

        return Interaction.where(this.toString(), async actor => {
            try {
                await this.performAs(actor);
            } catch (error) {
                throw RaiseErrors.as(actor).create(typeOfRuntimeError, {
                    message: message ?? error.message,
                    location,
                    cause: error,
                });
            }
        });
    }
}
