import { AnswersQuestions, Expectation, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';
import { match } from 'tiny-types';

export function and<Actual>(...expectations: Array<Expectation<any, Actual>>): Expectation<any, Actual> {
    return new And(expectations);
}

/**
 * @package
 */
class And<Actual> extends Expectation<any, Actual> {
    constructor(private readonly expectations: Array<Expectation<any, Actual>>) {
        super(expectations.map(assertion => assertion.toString()).join(' and '));
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<ExpectationOutcome<any, Actual>> {

        return (actual: any) =>
            this.expectations.reduce(
                (previous, current) =>
                    previous.then(outcome =>
                        match(outcome)
                            .when(ExpectationNotMet, o => o)
                            .else(_ => current.answeredBy(actor)(actual)),
                    ),
                Promise.resolve(void 0),
            );
    }
}
