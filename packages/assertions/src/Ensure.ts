import {
    Activity,
    Answerable,
    AnswersQuestions,
    AssertionError,
    CollectsArtifacts,
    d,
    Expectation,
    ExpectationMet,
    ExpectationNotMet,
    f,
    Interaction,
    LogicError,
    RaiseErrors,
    RuntimeError,
    UsesAbilities,
} from '@serenity-js/core';
import { FileSystemLocation } from '@serenity-js/core/lib/io';

import { EnsureEventually } from './EnsureEventually';

/**
 * The {@apilink Interaction|interaction} to `Ensure`
 * verifies if the resolved value of the provided {@apilink Answerable}
 * meets the specified {@apilink Expectation}.
 * If not, it throws an {@apilink AssertionError}.
 *
 * Use `Ensure` to verify the state of the system under test.
 *
 * ## Basic usage with static values
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Erica').attemptsTo(
 *   Ensure.that('Hello world!', equals('Hello world!'))
 * )
 * ```
 *
 * ## Composing expectations with `and`
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { and, Ensure, startsWith, endsWith } from '@serenity-js/assertions'
 *
 * await actorCalled('Erica').attemptsTo(
 *   Ensure.that('Hello world!', and(startsWith('Hello'), endsWith('!'))
 * )
 * ```
 *
 * ## Overriding the type of Error thrown upon assertion failure
 *
 * ```ts
 * import { actorCalled, TestCompromisedError } from '@serenity-js/core'
 * import { and, Ensure, startsWith, endsWith } from '@serenity-js/assertions'
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 *
 * await actorCalled('Erica')
 *   .whoCan(CallAnApi.at('https://example.com'))
 *   .attemptsTo(
 *     Send.a(GetRequest.to('/api/health')),
 *     Ensure.that(LastResponse.status(), equals(200))
 *       .otherwiseFailWith(TestCompromisedError, 'The server is down, please cheer it up!')
 *   )
 * ```
 *
 * @group Activities
 */
export class Ensure<Actual> extends Interaction {

    /**
     * Creates an {@apilink Interaction|interaction} to `Ensure`, which
     * verifies if the resolved value of the provided {@apilink Answerable}
     * meets the specified {@apilink Expectation}.
     * If not, it immediately throws an {@apilink AssertionError}.
     *
     * @param {Answerable<Actual_Type>} actual
     *  An {@apilink Answerable} describing the actual state of the system.
     *
     * @param {Expectation<Actual_Type>} expectation
     *  An {@apilink Expectation} you expect the `actual` value to meet
     *
     * @returns {Ensure<Actual_Type>}
     */
    static that<Actual_Type>(actual: Answerable<Actual_Type>, expectation: Expectation<Actual_Type>): Ensure<Actual_Type> {
        return new Ensure(actual, expectation, Activity.callerLocation(5));
    }

    /**
     * Creates an {@apilink Interaction|interaction} to {@apilink EnsureEventually}, which
     * verifies if the resolved value of the provided {@apilink Answerable}
     * meets the specified {@apilink Expectation} within the expected timeframe.
     *
     * If the expectation is not met by the time the timeout expires, the interaction throws an {@apilink AssertionError}.
     * `EnsureEventually` ignores retries the evaluation if resolving the `actual` results in an {@apilink OptionalNotPresentError},
     * but rethrows any other errors.
     *
     * @param {Answerable<Actual_Type>} actual
     *  An {@apilink Answerable} describing the actual state of the system.
     *
     * @param {Expectation<Actual_Type>} expectation
     *  An {@apilink Expectation} you expect the `actual` value to meet
     *
     * @returns {Ensure<Actual_Type>}
     */
    static eventually<Actual_Type>(actual: Answerable<Actual_Type>, expectation: Expectation<Actual_Type>): EnsureEventually<Actual_Type> {
        return new EnsureEventually(actual, expectation, Activity.callerLocation(5));
    }

    /**
     * @param actual
     * @param expectation
     * @param location
     */
    private constructor(
        protected readonly actual: Answerable<Actual>,
        protected readonly expectation: Expectation<Actual>,
        location: FileSystemLocation,
    ) {
        super(d`#actor ensures that ${ actual } does ${ expectation }`, location);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): Promise<void> {
        const outcome = await actor.answer(this.expectation.isMetFor(this.actual));

        if (outcome instanceof ExpectationNotMet) {
            const actualDescription = d`${ this.actual }`;
            const message = `Expected ${ actualDescription } to ${ outcome.message }`;

            throw RaiseErrors.as(actor).create(AssertionError, {
                message,
                expectation: outcome.expectation,
                diff: { expected: outcome.expected, actual: outcome.actual },
                location: this.instantiationLocation(),
            });
        }

        if (! (outcome instanceof ExpectationMet)) {
            throw new LogicError(f`Expectation#isMetFor(actual) should return an instance of an ExpectationOutcome, not ${ outcome }`);
        }
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
            }
            catch (error) {
                throw RaiseErrors.as(actor).create(typeOfRuntimeError, {
                    message: message ?? error.message,
                    location,
                    cause: error
                });
            }
        });
    }
}
