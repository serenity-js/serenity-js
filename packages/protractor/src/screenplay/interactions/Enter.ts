import { Answerable, AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { withAnswerOf } from '../withAnswerOf';

export class Enter extends Interaction {
    static theValue(value: Answerable<string | number>) {
        return {
            into: (field: Question<ElementFinder> | ElementFinder) => new Enter(value, field),
        };
    }

    constructor(
        private readonly value: Answerable<string | number>,
        private readonly field: Question<ElementFinder> | ElementFinder,
    ) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.value)
            .then(value => withAnswerOf(actor, this.field, elf => elf.sendKeys(value)));
    }

    toString(): string {
        return formatted `#actor enters ${this.value} into ${this.field}`;
    }
}
