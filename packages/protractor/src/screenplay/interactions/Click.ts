import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { withAnswerOf } from '../withAnswerOf';

export class Click extends Interaction {
    static on(target: Question<ElementFinder> | ElementFinder) {
        return new Click(target);
    }

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return withAnswerOf(actor, this.target, elf => elf.click());
    }

    toString(): string {
        return formatted `#actor clicks on ${ this.target }`;
    }
}
