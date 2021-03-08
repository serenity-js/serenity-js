import { ListAdapter } from '@serenity-js/core/lib/screenplay/questions/lists';
import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder } from 'protractor';

export class ElementArrayFinderListAdapter implements ListAdapter<ElementFinder, ElementArrayFinder> {
    constructor(private readonly elementArrayFinder: Question<ElementArrayFinder> | ElementArrayFinder) {
    }

    count(actor: AnswersQuestions & UsesAbilities): Promise<number> {
        return Promise.resolve(this.elements(actor).count());
    }

    first(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return this.elements(actor).first();
    }

    last(actor: AnswersQuestions & UsesAbilities): ElementFinder {
        return this.elements(actor).last();
    }

    get(actor: AnswersQuestions & UsesAbilities, index: number): ElementFinder {
        return this.elements(actor).get(index);
    }

    items(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return this.elements(actor);
    }

    private elements(actor: AnswersQuestions & UsesAbilities): ElementArrayFinder {
        return Question.isAQuestion(this.elementArrayFinder)
            ? this.elementArrayFinder.answeredBy(actor)
            : this.elementArrayFinder;
    }
}
