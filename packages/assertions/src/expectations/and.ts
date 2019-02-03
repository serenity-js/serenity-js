import { AnswersQuestions } from '@serenity-js/core';
import { match } from 'tiny-types';
import { Expectation } from '../Expectation';
import { ExpectationNotMet, Outcome } from '../outcomes';

export function and<Actual>(...expectations: Array<Expectation<any, Actual>>): Expectation<any, Actual> {
    return new And(expectations);
}

class And<Actual> extends Expectation<any, Actual> {
    constructor(private readonly expectations: Array<Expectation<any, Actual>>) {
        super();
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<Outcome<any, Actual>> {

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

    toString(): string {
        return this.expectations.map(assertion => assertion.toString()).join(' and ');
    }
}
