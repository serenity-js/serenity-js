import { AnswersQuestions, Interaction, LogicError, Question, UsesAbilities } from '@serenity-js/core';
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
            elf.getAttribute('value').then(value => {
                if (! value) {
                    throw new LogicError(
                        `${ this.capitaliseFirstLetter(this.field.toString()) } doesn't seem to have a 'value' attribute that could be cleared.`,
                    );
                }

                return this.removeCharactersFrom(elf, value.length);
            }));
    }

    toString(): string {
        return formatted `#actor clears the value of ${ this.field }`;
    }

    private capitaliseFirstLetter(text: string) {
        return text.charAt(0).toUpperCase() + text.substring(1);
    }

    private removeCharactersFrom(elf: ElementFinder, numberOfCharacters: number): PromiseLike<void> {
        return numberOfCharacters === 0
            ? Promise.resolve(void 0)
            : elf.sendKeys(
                protractor.Key.END,
                ...this.times(numberOfCharacters, protractor.Key.BACK_SPACE),
            );
    }

    private times(n: number, key: string) {
        return Array.from(new Array(n)).map(() => key);
    }
}
