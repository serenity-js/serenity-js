import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { BrowseTheWeb } from '../abilities';
import { withAnswerOf } from '../withAnswerOf';

export class DoubleClick extends Interaction {
    static on(target: Question<ElementFinder> | ElementFinder) {
        return new DoubleClick(target);
    }

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        // Since the deprecation of Webdriver's ControlFlow,
        // Protractor's doubleClick might behave incorrectly when promises are used.
        // The mouseMove/doubleClick combo works around that problem.
        // See https://github.com/angular/protractor/issues/4578

        return withAnswerOf(actor, this.target, elf =>
            BrowseTheWeb.as(actor).actions()
                .mouseMove(elf)
                .perform()
                .then(() => BrowseTheWeb.as(actor).actions().doubleClick().perform()));
    }

    toString(): string {
        return formatted `#actor double-clicks on ${ this.target }`;
    }
}
