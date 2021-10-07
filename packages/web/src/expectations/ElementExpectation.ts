import { AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';

import { Element } from '../ui';

/**
 * @access private
 */
export class ElementExpectation extends Expectation<any, Element> {
    static forElementTo(message: string, fn: (actual: Element) => Promise<boolean>): Expectation<any, Element> {
        return new ElementExpectation(message, fn);
    }

    constructor(
        subject: string,
        private readonly fn: (actual: Element) => Promise<boolean>,
    ) {
        super(subject);
    }

    answeredBy(actor: AnswersQuestions): (actual: Element) => Promise<ExpectationOutcome<boolean, Element>> {
        return (actual: Element) =>
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
