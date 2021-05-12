import { AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';
import { match } from 'tiny-types';

export function not<Expected, Actual>(assertion: Expectation<Expected, Actual>): Expectation<Expected, Actual> {
    return new Not<Expected, Actual>(assertion);
}

/**
 * @package
 */
class Not<Expected, Actual> extends Expectation<Expected, Actual> {
    private static flipped(message: string): string {
        return message.startsWith('not ')
            ? message.slice(4)
            : `not ${ message }`;
    }

    constructor(private readonly expectation: Expectation<Expected, Actual>) {
        super(Not.flipped(expectation.toString()));
    }

    answeredBy(actor: AnswersQuestions): (actual: Actual) => Promise<ExpectationOutcome<Expected, Actual>> {

        return (actual: any) =>
            this.expectation.answeredBy(actor)(actual)
                .then((outcome: ExpectationOutcome<Expected, Actual>) =>
                    match<ExpectationOutcome<Expected, Actual>, ExpectationOutcome<Expected, Actual>>(outcome)
                        .when(ExpectationMet, o => new ExpectationNotMet(this.subject, o.expected, o.actual))
                        .else(o => new ExpectationMet(this.subject, o.expected, o.actual)));
    }
}
