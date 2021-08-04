import { AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';
import { Element } from 'webdriverio';

/**
 * @access private
 */
export class ElementExpectation extends Expectation<any, Element<'async'>> {
    static forElementTo(message: string, fn: (actual: Element<'async'>) => Promise<boolean>): Expectation<any, Element<'async'>> {
        return new ElementExpectation(message, fn);
    }

    constructor(
        subject: string,
        private readonly fn: (actual: Element<'async'>) => Promise<boolean>,
    ) {
        super(subject);
    }

    answeredBy(actor: AnswersQuestions): (actual: Element<'async'>) => Promise<ExpectationOutcome<boolean, Element<'async'>>> {
        return (actual: Element<'async'>) =>
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
