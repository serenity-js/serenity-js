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
    ExpectationOutcome,
    f,
    Interaction,
    LogicError,
    RuntimeError,
    UsesAbilities,
} from '@serenity-js/core';
import { FileSystemLocation } from '@serenity-js/core/lib/io';
import { inspected } from '@serenity-js/core/lib/io/inspected';
import { Artifact, AssertionReport, Name } from '@serenity-js/core/lib/model';
import { match } from 'tiny-types';

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
 * @group Interactions
 */
export class Ensure<Actual> extends Interaction {

    /**
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
     * @param actual
     * @param expectation
     * @param location
     */
    protected constructor(
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

        return match<ExpectationOutcome<unknown, Actual>, void>(outcome)
            .when(ExpectationNotMet, o => {
                actor.collect(this.artifactFrom(o.expected, o.actual), new Name(`Assertion Report`));

                throw this.errorForOutcome(o);
            })
            .when(ExpectationMet, _ => void 0)
            .else(o => {
                throw new LogicError(f`Expectation#isMetFor(actual) should return an instance of an ExpectationOutcome, not ${ o }`);
            });
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
        return new EnsureOrFailWithCustomError(this.actual, this.expectation, typeOfRuntimeError, message);
    }

    /**
     * Maps an {@apilink ExpectationOutcome} to appropriate {@apilink RuntimeError}.
     */
    protected errorForOutcome(outcome: ExpectationOutcome<any, Actual>): RuntimeError {
        return this.asAssertionError(outcome);
    }

    /**
     * Maps an {@apilink Outcome} to {@apilink AssertionError}.
     *
     * @param outcome
     */
    protected asAssertionError(outcome: ExpectationOutcome<any, Actual>): AssertionError {
        const actualDescription = d`${ this.actual }`;
        const inspectedActual = inspected(outcome.actual, { inline: true, markQuestions: false });
        const message = actualDescription === inspectedActual
            ? `Expected ${ actualDescription } to ${ outcome.message }`
            : `Expected ${ actualDescription } to ${ outcome.message } but got ${ inspectedActual }`;

        return new AssertionError(
            message,
            outcome.expected,
            outcome.actual,
        );
    }

    private artifactFrom(expected: any, actual: Actual): Artifact {
        return AssertionReport.fromJSON({
            expected: inspected(expected),
            actual: inspected(actual),
        });
    }
}

/**
 * @package
 */
class EnsureOrFailWithCustomError<Actual> extends Ensure<Actual> {
    constructor(
        actual: Answerable<Actual>,
        expectation: Expectation<Actual>,
        private readonly typeOfRuntimeError: new (message: string, cause?: Error) => RuntimeError,
        private readonly message?: string,
    ) {
        super(actual, expectation, Activity.callerLocation(6));
    }

    protected errorForOutcome(outcome: ExpectationOutcome<any, Actual>): RuntimeError {
        const assertionError = this.asAssertionError(outcome);

        return new this.typeOfRuntimeError(this.message || assertionError.message, assertionError);
    }
}
