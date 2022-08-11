import { Answerable, AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome, LogicError } from '@serenity-js/core';

/**
 * Creates an {@apilink Expectation|expectation} that is met when at least one of the `expectations` is met for the given actual value.
 *
 * Use `or` to combine several expectations using logical "or",
 *
 * ## Combining several expectations
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, or, startsWith } from '@serenity-js/assertions'
 *
 * await actorCalled('Ester').attemptsTo(
 *   Ensure.that('Hello World!', or(startsWith('Hello'), startsWith('Hi'))),
 * )
 * ```
 *
 * @param expectations
 *
 * @group Expectations
 */
export function or<Actual_Type>(...expectations: Array<Expectation<Actual_Type>>): Expectation<Actual_Type> {
    return new Or(expectations);
}

/**
 * @package
 */
class Or<Actual> extends Expectation<Actual> {
    private static readonly Separator = ' or ';

    private static descriptionFor<A>(expectations: Array<Expectation<A>>): string {
        return expectations
            .map(expectation => expectation.toString())
            .join(Or.Separator);
    }

    constructor(private readonly expectations: Array<Expectation<Actual>>) {
        super(
            Or.descriptionFor(expectations),
            async (actor: AnswersQuestions, actual: Answerable<Actual>) => {
                if (! expectations || expectations.length === 0) {
                    throw new LogicError(`No expectations provided to or()`);
                }

                let outcome: ExpectationOutcome<unknown, Actual>;
                for (const expectation of expectations) {
                    outcome = await actor.answer(expectation.isMetFor(actual));

                    if (outcome instanceof ExpectationMet) {
                        return outcome;
                    }
                }

                return new ExpectationNotMet(
                    Or.descriptionFor(expectations),
                    outcome.expected,
                    outcome.actual,
                );
            }
        );
    }
}
