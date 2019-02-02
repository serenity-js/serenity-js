import { AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { promiseOf } from '../promiseOf';
import { Target } from '../questions';

export class Clear implements Interaction {
    static theValueOf(field: Target<ElementFinder>) {
        return new Clear(field);
    }

    constructor(private readonly field: Target<ElementFinder>) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return promiseOf(this.field.answeredBy(actor).clear());
    }

    toString(): string {
        return formatted `#actor clear the value of ${ this.field }`;
    }
}
