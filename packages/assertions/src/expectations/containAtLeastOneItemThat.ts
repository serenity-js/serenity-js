import { AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

export function containAtLeastOneItemThat<Actual>(expectation: Expectation<any, Actual>): Expectation<any, Actual[]> {
    return new ContainAtLeastOneItemThatMeetsExpectation(expectation);
}

/**
 * @package
 */
class ContainAtLeastOneItemThatMeetsExpectation<Expected, Actual> extends Expectation<Expected, Actual[]> {
    constructor(private readonly expectation: Expectation<Expected, Actual>) {
        super(formatted `contain at least one item that does ${ expectation }`);
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual[]) => Promise<ExpectationOutcome<Expected, Actual[]>> {
        return (actual: Actual[]) =>
            actual.length === 0
                ? Promise.resolve(new ExpectationNotMet(this.toString(), undefined, actual))
                : Promise.all(actual.map(item => this.expectation.answeredBy(actor)(item)))
                    .then(results => results.some(result => result instanceof ExpectationMet)
                        ? new ExpectationMet(this.toString(), results[0].expected, actual)
                        : new ExpectationNotMet(this.toString(), results[0].expected, actual),
                    );
    }
}
