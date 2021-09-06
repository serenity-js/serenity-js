import { AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';

import { UIElement } from '../ui';

/**
 * @access private
 */
export class ElementExpectation extends Expectation<any, UIElement> {
    static forElementTo(message: string, fn: (actual: UIElement) => Promise<boolean>): Expectation<any, UIElement> {
        return new ElementExpectation(message, fn);
    }

    constructor(
        subject: string,
        private readonly fn: (actual: UIElement) => Promise<boolean>,
    ) {
        super(subject);
    }

    answeredBy(actor: AnswersQuestions): (actual: UIElement) => Promise<ExpectationOutcome<boolean, UIElement>> {
        return (actual: UIElement) =>
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
