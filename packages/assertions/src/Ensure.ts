import {
    Answerable,
    AnswersQuestions,
    AssertionError,
    CollectsArtifacts,
    Expectation,
    ExpectationMet,
    ExpectationNotMet,
    ExpectationOutcome,
    Interaction,
    LogicError,
    RuntimeError,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { inspected } from '@serenity-js/core/lib/io/inspected';
import { Artifact, AssertionReport, Name } from '@serenity-js/core/lib/model';
import { match } from 'tiny-types';

/**
 * @desc
 *  Used to perform verification of the system under test.
 *
 *  Resolves any `Answerable` describing the actual
 *  state and ensures that its value meets the {@link @serenity-js/core/lib/screenplay/questions~Expectation}s provided.
 *
 * @example <caption>Usage with static values</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = actorCalled('Erica');
 *
 *  actor.attemptsTo(
 *    Ensure.that('Hello world!', equals('Hello world!'))
 *  );
 *
 * @example <caption>Composing expectations with `and`</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { and, Ensure, startsWith, endsWith } from '@serenity-js/assertions';
 *
 *  const actor = actorCalled('Erica');
 *
 *  actor.attemptsTo(
 *    Ensure.that('Hello world!', and(startsWith('Hello'), endsWith('!'))
 *  );
 *
 * @example <caption>Overriding the type of Error thrown upon assertion failure</caption>
 *  import { actorCalled, TestCompromisedError } from '@serenity-js/core';
 *  import { and, Ensure, startsWith, endsWith } from '@serenity-js/assertions';
 *  import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest';
 *
 *  const actor = actorCalled('Erica')
 *      .whoCan(CallAnApi.at('https://example.com'));
 *
 *  actor.attemptsTo(
 *    Send.a(GetRequest.to('/api/health')),
 *    Ensure.that(LastResponse.status(), equals(200))
 *      .otherwiseFailWith(TestCompromisedError, 'The server is down, please cheer it up!')
 *  );
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class Ensure<Actual> extends Interaction {
    /**
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<T>} actual
     * @param {@serenity-js/core/lib/screenplay/questions~Expectation<any, A>} expectation
     *
     * @returns {Ensure<A>}
     */
    static that<A>(actual: Answerable<A>, expectation: Expectation<any, A>): Ensure<A> {
        return new Ensure(actual, expectation);
    }

    /**
     * @param {@serenity-js/core/lib/screenplay~Answerable<T>} actual
     * @param {@serenity-js/core/lib/screenplay/questions~Expectation<T>} expectation
     */
    constructor(
        protected readonly actual: Answerable<Actual>,
        protected readonly expectation: Expectation<Actual>,
    ) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & CollectsArtifacts & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~CollectsArtifacts}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions & CollectsArtifacts): Promise<void> {
        return Promise.all([
            actor.answer(this.actual),
            actor.answer(this.expectation),
        ]).then(([ actual, expectation ]) =>
            expectation(actual).then(outcome =>
                match<ExpectationOutcome<unknown, Actual>, void>(outcome)
                    .when(ExpectationNotMet, o => {
                        actor.collect(this.artifactFrom(o.expected, o.actual), new Name(`Assertion Report`));

                        throw this.errorForOutcome(o);
                    })
                    .when(ExpectationMet, _ => void 0)
                    .else(o => {
                        throw new LogicError(formatted `An Expectation should return an instance of an ExpectationOutcome, not ${ o }`);
                    }),
            ),
        );
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor ensures that ${ this.actual } does ${ this.expectation }`;
    }

    /**
     * @desc
     *  Overrides the default {@link @serenity-js/core/lib/errors~AssertionError} thrown when
     *  the actual value does not meet the expectations set.
     *
     * @param {Function} typeOfRuntimeError
     *  The type of RuntimeError to throw, i.e. TestCompromisedError
     *
     * @param {string} message
     *  The message explaining the failure
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    otherwiseFailWith(typeOfRuntimeError: new (message: string, cause?: Error) => RuntimeError, message?: string): Interaction {
        return new EnsureOrFailWithCustomError(this.actual, this.expectation, typeOfRuntimeError, message);
    }

    /**
     * @desc
     *  Maps an {@link @serenity-js/core/lib/screenplay/questions/expectations~ExpectationOutcome} to appropriate {@link @serenity-js/core/lib/errors~RuntimeError}.
     *
     * @param {@serenity-js/core/lib/screenplay/questions/expectations~ExpectationOutcome} outcome
     * @returns {@serenity-js/core/lib/errors~RuntimeError}
     *
     * @protected
     */
    protected errorForOutcome(outcome: ExpectationOutcome<any, Actual>): RuntimeError {
        return this.asAssertionError(outcome);
    }

    /**
     * @desc
     *  Maps an {@link Outcome} to {@link @serenity-js/core/lib/errors~AssertionError}.
     *
     * @param {Outcome} outcome
     * @returns {@serenity-js/core/lib/errors~AssertionError}
     *
     * @protected
     */
    protected asAssertionError(outcome: ExpectationOutcome<any, Actual>): AssertionError {
        return new AssertionError(
            `Expected ${ formatted`${ this.actual }` } to ${ outcome.message }`,
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
        super(actual, expectation);
    }

    protected errorForOutcome(outcome: ExpectationOutcome<any, Actual>): RuntimeError {
        const assertionError = this.asAssertionError(outcome);

        return new this.typeOfRuntimeError(this.message || assertionError.message, assertionError);
    }
}
