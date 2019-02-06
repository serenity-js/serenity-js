import { AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { BrowseTheWeb } from '../abilities';
import { promiseOf } from '../promiseOf';
import { Target } from '../questions';

export class DoubleClick implements Interaction {
    static on(target: Target<ElementFinder>) {
        return new DoubleClick(target);
    }

    constructor(private readonly target: Target<ElementFinder>) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return promiseOf(BrowseTheWeb.as(actor).actions()
            .doubleClick(this.target.answeredBy(actor))
            .perform(),
        );
    }

    toString(): string {
        return formatted `#actor double-clicks on ${ this.target }`;
    }
}
