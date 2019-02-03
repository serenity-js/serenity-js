import { AnswersQuestions } from '@serenity-js/core';

import { Expectation } from '../Expectation';
import { ExpectationMet, ExpectationNotMet, Outcome } from '../outcomes';

export function or<Actual>(...assertions: Array<Expectation<any, Actual>>): Expectation<any, Actual> {
    return new Or(assertions);
}

class Or<Actual> extends Expectation<any, Actual> {
    private static readonly Separator = ' or ';

    constructor(private readonly expectations: Array<Expectation<any, Actual>>) {
        super();
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<Outcome<any, Actual>> {

        return (actual: any) =>
            this.expectations.reduce(
                (previous, current) =>
                    previous.then((outcomesSoFar: Array<Outcome<any, Actual>>) =>
                        current.answeredBy(actor)(actual)
                            .then(outcome => outcomesSoFar.concat(outcome)),        // todo: should stop on the first met expectation
                        ),
                Promise.resolve([]),
            ).
            then((outcomes: Array<Outcome<any, Actual>>) => {

                const
                    unmetExpectations = outcomes.filter(outcome => outcome instanceof ExpectationNotMet),
                    message = outcomes.map(outcome => outcome.message).join(Or.Separator);

                return unmetExpectations.length === this.expectations.length
                    ? new ExpectationNotMet(message, outcomes[0].expected, outcomes[0].actual)
                    : new ExpectationMet(message, outcomes[0].expected, outcomes[0].actual);
            });
    }

    toString(): string {
        return this.expectations
            .map(assertion => assertion.toString())
            .join(Or.Separator);
    }
}
