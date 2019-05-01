import { Expectation, ExpectationMet, ExpectationNotMet, Outcome } from '@serenity-js/assertions';
import { AnswersQuestions } from '@serenity-js/core';
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
        private readonly message: string,
        private readonly fn: (actual: ElementFinder) => PromiseLike<boolean>,
    ) {
        super();
    }

    answeredBy(actor: AnswersQuestions): (actual: ElementFinder) => Promise<Outcome<boolean, ElementFinder>> {

        return (actual: ElementFinder) =>
            promiseOf(this.fn(actual)).then(_ => _
                ? new ExpectationMet(this.toString(), null, actual)
                : new ExpectationNotMet(this.toString(), null, actual),
            );
    }

    toString(): string {
        return this.message;
    }
}
