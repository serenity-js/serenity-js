import { Answerable, AnswersQuestions, Expectation, ExpectationNotMet } from '@serenity-js/core';
import { match } from 'tiny-types';

/**
 * Creates an {@apilink Expectation|expectation} that is met when all the `expectations` are met for the given actual value.
 *
 * Use `and` to combine several expectations using logical "and",
 *
 * ## Combining several expectations
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, and, startsWith, endsWith } from '@serenity-js/assertions'
 *
 * await actorCalled('Ester').attemptsTo(
 *   Ensure.that('Hello World!', and(startsWith('Hello'), endsWith('!'))),
 * )
 * ```
 *
 * @param expectations
 *
 * @group Expectations
 */
export function and<Actual_Type>(...expectations: Array<Expectation<Actual_Type>>): Expectation<Actual_Type> {
    return new And(expectations);
}

/**
 * @package
 */
class And<Actual> extends Expectation<Actual> {
    private static readonly Separator = ' and ';

    constructor(private readonly expectations: Array<Expectation<Actual>>) {
        super(
            expectations.map(expectation => expectation.toString()).join(And.Separator),
            (actor: AnswersQuestions, actual: Answerable<Actual>) => {
                return expectations.reduce(
                    (previous, current) =>
                        previous.then(outcome =>
                            match(outcome)
                                .when(ExpectationNotMet, o => o)
                                .else(_ => actor.answer(current.isMetFor(actual))),
                        ),
                    Promise.resolve(void 0),
                );
            }
        );
    }
}
