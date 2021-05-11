import { AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';

export function or<Actual>(...assertions: Array<Expectation<any, Actual>>): Expectation<any, Actual> {
    return new Or(assertions);
}

/**
 * @package
 */
class Or<Actual> extends Expectation<any, Actual> {
    private static readonly Separator = ' or ';

    constructor(private readonly expectations: Array<Expectation<any, Actual>>) {
        super(expectations
            .map(assertion => assertion.toString())
            .join(Or.Separator));
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<ExpectationOutcome<any, Actual>> {

        return (actual: any) =>
            this.expectations.reduce(
                (previous, current) =>
                    previous.then((outcomesSoFar: Array<ExpectationOutcome<any, Actual>>) =>
                        current.answeredBy(actor)(actual)
                            .then(outcome => outcomesSoFar.concat(outcome)),        // todo: should stop on the first met expectation
                    ),
                Promise.resolve([]),
            ).
            then((outcomes: Array<ExpectationOutcome<any, Actual>>) => {

                const
                    unmetExpectations = outcomes.filter(outcome => outcome instanceof ExpectationNotMet),
                    message = outcomes.map(outcome => outcome.message).join(Or.Separator);

                return unmetExpectations.length === this.expectations.length
                    ? new ExpectationNotMet(message, outcomes[0].expected, outcomes[0].actual)
                    : new ExpectationMet(message, outcomes[0].expected, outcomes[0].actual);
            });
    }
}
