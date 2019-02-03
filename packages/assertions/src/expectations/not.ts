import { AnswersQuestions } from '@serenity-js/core';
import { match } from 'tiny-types';

import { Expectation } from '../Expectation';
import { ExpectationMet, ExpectationNotMet, Outcome } from '../outcomes';

export function not<Expected, Actual>(assertion: Expectation<Expected, Actual>): Expectation<Expected, Actual> {
    return new Not<Expected, Actual>(assertion);
}

class Not<Expected, Actual> extends Expectation<Expected, Actual> {
    constructor(private readonly assertion: Expectation<Expected, Actual>) {
        super();
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<Outcome<Expected, Actual>> {

        return (actual: any) =>
            this.assertion.answeredBy(actor)(actual)
                .then((outcome: Outcome<Expected, Actual>) =>
                    match<Outcome<Expected, Actual>, Outcome<Expected, Actual>>(outcome)
                        .when(ExpectationMet, o => new ExpectationNotMet(this.flipped(this.assertion.toString()), o.expected, o.actual))
                        .else(o => new ExpectationMet(this.flipped(this.assertion.toString()), o.expected, o.actual)));
    }

    toString(): string {
        return this.flipped(this.assertion.toString());
    }

    private flipped(message: string): string {
        return message.startsWith('not ')
            ? message.substring(4)
            : `not ${ message }`;
    }
}
