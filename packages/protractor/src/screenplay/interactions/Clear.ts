import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder, protractor } from 'protractor';
import { withAnswerOf } from '../withAnswerOf';

export class Clear extends Interaction {
    static theValueOf(field: Question<ElementFinder> | ElementFinder) {
        return new Clear(field);
    }

    constructor(private readonly field: Question<ElementFinder> | ElementFinder) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return withAnswerOf(actor, this.field, elf =>
            elf.getAttribute('value').then(value =>
                elf.sendKeys(
                    protractor.Key.END,
                    ...this.times(value.length, protractor.Key.BACK_SPACE),
                ),
            ));
    }

    toString(): string {
        return formatted `#actor clears the value of ${ this.field }`;
    }

    private times(n: number, key: string) {
        return Array.from(new Array(n)).map(() => key);
    }
}
