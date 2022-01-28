import { Answerable, AnswersQuestions, Expectation, ExpectationNotMet } from '@serenity-js/core';
import { match } from 'tiny-types';

export function and<Actual>(...expectations: Array<Expectation<Actual>>): Expectation<Actual> {
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
