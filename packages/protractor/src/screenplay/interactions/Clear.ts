import { AnswersQuestions, Interaction, KnowableUnknown, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';

export class Clear implements Interaction {
    static theValueOf(field: KnowableUnknown<ElementFinder>) {
        return new Clear(field);
    }

    constructor(private readonly field: KnowableUnknown<ElementFinder>) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.field).then(finder => finder.clear());
    }

    toString(): string {
        return formatted `#actor clears the value of ${ this.field }`;
    }
}
