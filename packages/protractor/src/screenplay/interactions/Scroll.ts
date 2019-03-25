import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { BrowseTheWeb } from '../abilities';
import { withAnswerOf } from '../withAnswerOf';

export class Scroll extends Interaction {
    static to(target: Question<ElementFinder> | ElementFinder) {
        return new Scroll(target);
    }

    constructor(
        private readonly target: Question<ElementFinder> | ElementFinder,
    ) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return withAnswerOf(actor, this.target, elf => BrowseTheWeb.as(actor).actions().mouseMove(elf).perform());
    }

    toString(): string {
        return formatted `#actor scrolls to ${this.target}`;
    }
}
