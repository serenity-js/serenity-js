import { AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { promiseOf } from '../promiseOf';
import { Target } from '../questions';

export class Click implements Interaction {
    static on(target: Target<ElementFinder>) {
        return new Click(target);
    }

    constructor(private readonly target: Target<ElementFinder>) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return promiseOf(this.target.answeredBy(actor).click());
    }

    toString(): string {
        return formatted `#actor clicks on ${ this.target }`;
    }
}
