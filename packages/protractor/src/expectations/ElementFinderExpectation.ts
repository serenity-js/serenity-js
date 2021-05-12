import { AnswersQuestions, Expectation, ExpectationMet, ExpectationNotMet, ExpectationOutcome } from '@serenity-js/core';
import { ElementFinder } from 'protractor';
import { promiseOf } from '../promiseOf';

/**
 * @access private
 */
export class ElementFinderExpectation extends Expectation<any, ElementFinder> {
    static forElementTo(message: string, fn: (actual: ElementFinder) => PromiseLike<boolean>): Expectation<any, ElementFinder> {
        return new ElementFinderExpectation(message, fn);
    }

    constructor(
        subject: string,
        private readonly fn: (actual: ElementFinder) => PromiseLike<boolean>,
    ) {
        super(subject);
    }

    answeredBy(actor: AnswersQuestions): (actual: ElementFinder) => Promise<ExpectationOutcome<boolean, ElementFinder>> {

        return (actual: ElementFinder) =>
            promiseOf(this.fn(actual)).then(_ => _
                ? new ExpectationMet(this.toString(), undefined, actual)
                : new ExpectationNotMet(this.toString(), undefined, actual),
            );
    }
}
