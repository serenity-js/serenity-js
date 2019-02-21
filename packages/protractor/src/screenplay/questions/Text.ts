import { AnswersQuestions, KnowableUnknown, Question, UsesAbilities } from '@serenity-js/core';
import { ElementFinder } from 'protractor';

export class Text {

    static of(target: KnowableUnknown<ElementFinder>): Question<Promise<string>> {
        return new TextOfSingleElement(target);
    }

    static ofAll(target: KnowableUnknown<ElementFinder[]>): Question<Promise<string[]>> {
        return new TextOfMultipleElements(target);
    }
}

export class TextOfSingleElement implements Question<Promise<string>> {
    constructor(protected readonly target: KnowableUnknown<ElementFinder>) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return actor.answer(this.target).then(finder => finder.getText()) as any;
    }

    toString() {
        return `the text of ${ this.target }`;
    }
}

export class TextOfMultipleElements implements Question<Promise<string[]>> {
    constructor(protected readonly target: KnowableUnknown<ElementFinder[]>) {
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {

        return actor.answer(this.target)
            .then(finders => finders.map(finder => finder.getText()))
            .then(list => Promise.all(list));
    }

    toString() {
        return `the text of ${ this.target }`;
    }
}
