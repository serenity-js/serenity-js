import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { BrowseTheWeb } from '../abilities';
import { withAnswerOf } from '../withAnswerOf';

export class DoubleClick implements Interaction {
    static on(target: Question<ElementFinder> | ElementFinder) {
        return new DoubleClick(target);
    }

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return withAnswerOf(actor, this.target, elf =>
            BrowseTheWeb.as(actor).actions()
                .doubleClick(elf)
                .perform());
    }

    toString(): string {
        return formatted `#actor double-clicks on ${ this.target }`;
    }
}
