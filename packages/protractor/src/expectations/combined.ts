import { and, Expectation, ExpectationMet, ExpectationNotMet, Outcome } from '@serenity-js/assertions';
import { AnswersQuestions } from '@serenity-js/core';
import { ElementFinder } from 'protractor';

/**
 * @access private
 * @param message
 * @param expectations
 */
export function combined(message: string, ...expectations: Array<Expectation<any, ElementFinder>>): Expectation<any, ElementFinder> {
    return new Combined(message, expectations);
}

class Combined extends Expectation<any, ElementFinder> {
    constructor(
        private readonly message: string,
        private readonly expectations: Array<Expectation<any, ElementFinder>>,
    ) {
        super();
    }

    answeredBy(actor: AnswersQuestions): (actual: ElementFinder) => Promise<Outcome<any, ElementFinder>> {
        return (actual: ElementFinder) =>
            and(...this.expectations).answeredBy(actor)(actual).then(_ => _ instanceof ExpectationMet
                ? new ExpectationMet(this.message, _.expected, _.actual)
                : new ExpectationNotMet(_.message, _.expected, _.actual));
    }

    toString(): string {
        return this.message;
    }
}
