import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { promiseOf } from '../../promiseOf';
import { withAnswerOf } from '../withAnswerOf';

export class Selected {
    static valueOf(target: Question<ElementFinder> | ElementFinder) {
        return new SelectedValue(target);
    }

    static valuesOf(target: Question<ElementFinder> | ElementFinder) {
        return new SelectedValues(target);
    }

    static optionOf(target: Question<ElementFinder> | ElementFinder) {
        return new SelectedOption(target);
    }

    static optionsOf(target: Question<ElementFinder> | ElementFinder) {
        return new SelectedOptions(target);
    }
}

/**
 * @package
 */
class SelectedValue implements Question<Promise<string>> {

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const value = withAnswerOf(actor, this.target, (element: ElementFinder) =>
            element.$('option:checked').getAttribute('value')
        );

        return promiseOf(value);
    }

    toString() {
        return formatted `value selected in ${ this.target }`;
    }
}

/**
 * @package
 */
class SelectedValues implements Question<Promise<string[]>> {

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        const options = withAnswerOf(actor, this.target, (element: ElementFinder) => element.$$('option')
            .filter(option => option.isSelected()));

        return promiseOf(options.map(option => option.getAttribute('value')));
    }

    toString() {
        return formatted `values selected in ${ this.target }`;
    }
}

/**
 * @package
 */
class SelectedOption implements Question<Promise<string>> {
    static of(target: Question<ElementFinder> | ElementFinder) {
        return new SelectedOption(target);
    }

    constructor(private target: Question<ElementFinder> | ElementFinder) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return promiseOf(withAnswerOf(actor, this.target, element => element.$('option:checked').getText()));
    }

    toString() {
        return formatted `option selected in ${ this.target }`;
    }
}

/**
 * @package
 */
class SelectedOptions implements Question<Promise<string[]>> {
    static of(target: Question<ElementFinder> | ElementFinder) {
        return new SelectedOptions(target);
    }

    constructor(private target: Question<ElementFinder> | ElementFinder) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        return promiseOf(withAnswerOf(actor, this.target, element => element.$$('option')
            .filter(option => option.isSelected())
            .map(elements => elements.getText())));
    }

    toString() {
        return formatted `options selected in ${ this.target }`;
    }
}
