import { Answerable, AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome, LogicError } from '@serenity-js/core';

export function or<Actual>(...assertions: Array<Expectation<Actual>>): Expectation<Actual> {
    return new Or(assertions);
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
