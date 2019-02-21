import { AnswersQuestions, Interaction, KnowableUnknown, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';

export class Click implements Interaction {
    static on(target: KnowableUnknown<ElementFinder>) {
        return new Click(target);
    }

    constructor(private readonly target: KnowableUnknown<ElementFinder>) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.target).then(finder => finder.click());
    }

    toString(): string {
        return formatted `#actor clicks on ${ this.target }`;
    }
}
