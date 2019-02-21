import { AnswersQuestions, Interaction, KnowableUnknown, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { BrowseTheWeb } from '../abilities';

export class DoubleClick implements Interaction {
    static on(target: KnowableUnknown<ElementFinder>) {
        return new DoubleClick(target);
    }

    constructor(private readonly target: KnowableUnknown<ElementFinder>) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.target)
            .then(finder => BrowseTheWeb.as(actor).actions()
                .doubleClick(finder)
                .perform());
    }

    toString(): string {
        return formatted `#actor double-clicks on ${ this.target }`;
    }
}
