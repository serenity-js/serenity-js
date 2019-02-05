import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder } from 'protractor';
import { WebElement } from 'selenium-webdriver';

import { promiseOf } from '../promiseOf';
import { Target } from './Target';

export abstract class Text<T extends WebElement, R> implements Question<Promise<R>> {

    static of(target: Target<ElementFinder>) {
        return new TextOfSingleElement(target);
    }

    static ofAll(target: Target<ElementArrayFinder>) {
        return new TextOfMultipleElements(target);
    }

    constructor(protected readonly target: Target<T>) {
    }

    abstract answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<R>;
}

class TextOfSingleElement extends Text<ElementFinder, string> {
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return promiseOf(this.target.answeredBy(actor).getText()) as any;
    }

    toString() {
        return `the text of ${ this.target }`;
    }
}

class TextOfMultipleElements extends Text<ElementArrayFinder, string[]> {
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        // protractor ignores type definitions for the ElementArrayFinder, hence the Promise<any>
        // https://github.com/angular/protractor/blob/c3978ec166760ac07db01e700c4aaaa19d9b5c38/lib/element.ts#L92
        return promiseOf(this.target.answeredBy(actor).getText()) as any;
    }

    toString() {
        return `the text of ${ this.target }`;
    }
}
