import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder } from 'protractor';
import { promiseOf } from '../../promiseOf';
import { withAnswerOf } from '../withAnswerOf';

export class SelectedText implements Question<Promise<string>> {
    static of(target: Question<ElementFinder> | ElementFinder) {
        return new SelectedText(target);
    }

    constructor(private target: Question<ElementFinder> | ElementFinder) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return promiseOf(withAnswerOf(actor, this.target, element => element.$('option:checked').getText()));
    }

    toString = () => `the selected visible text of ${this.target}`;
}

export class SelectedTextItems implements Question<Promise<string[]>> {
    static of(target: Question<ElementFinder> | ElementFinder) {
        return new SelectedTextItems(target);
    }

    constructor(private target: Question<ElementFinder> | ElementFinder) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        return promiseOf(withAnswerOf(actor, this.target, element => element.$$('option')
            .filter(option => option.isSelected())
            .map(elements => elements.getText())));
    }

    toString = () => `the selected visible text items of ${this.target}`;
}
