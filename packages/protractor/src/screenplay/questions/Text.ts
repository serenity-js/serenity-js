import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder } from 'protractor';
import { withElementFinder } from '../withElementFinder';

export class Text {

    static of(target: Question<ElementFinder> | ElementFinder): Question<Promise<string>> {
        return new TextOfSingleElement(target);
    }

    static ofAll(target: Question<ElementArrayFinder> | ElementArrayFinder): Question<Promise<string[]>> {
        return new TextOfMultipleElements(target);
    }
}

export class TextOfSingleElement implements Question<Promise<string>> {
    constructor(protected readonly target: Question<ElementFinder> | ElementFinder) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return withElementFinder<Promise<string>>(actor, this.target, elf => elf.getText() as any);
    }

    toString() {
        return `the text of ${ this.target }`;
    }
}

export class TextOfMultipleElements implements Question<Promise<string[]>> {
    constructor(protected readonly target: Question<ElementArrayFinder> | ElementArrayFinder) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {

        const eaf = this.target instanceof ElementArrayFinder
            ? this.target
            : this.target.answeredBy(actor);

        // protractor ignores type definitions for the ElementArrayFinder, hence the `any`
        // https://github.com/angular/protractor/blob/c3978ec166760ac07db01e700c4aaaa19d9b5c38/lib/element.ts#L92
        return Promise.resolve(eaf.getText() as any) as Promise<string[]>;
    }

    toString() {
        return `the text of ${ this.target }`;
    }
}
