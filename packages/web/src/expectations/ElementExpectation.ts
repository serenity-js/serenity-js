import { AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';

import { PageElement } from '../ui';

/**
 * @access private
 */
export class ElementExpectation extends Expectation<any, PageElement> {
    static forElementTo(message: string, fn: (actual: PageElement) => Promise<boolean>): Expectation<any, PageElement> {
        return new ElementExpectation(message, fn);
    }

    constructor(
        subject: string,
        private readonly fn: (actual: PageElement) => Promise<boolean>,
    ) {
        super(subject);
    }

    answeredBy(actor: AnswersQuestions): (actual: PageElement) => Promise<ExpectationOutcome<boolean, PageElement>> {
        return (actual: PageElement) =>
            this.fn(actual)
                .then(expectationMet =>
                    expectationMet
                        ? new ExpectationMet(this.toString(), undefined, actual)
                        : new ExpectationNotMet(this.toString(), undefined, actual),
                )
                .catch(error => {
                    return new ExpectationNotMet(`${ this.toString() } (${ error.message })`, undefined, actual);
                });
    }
}
