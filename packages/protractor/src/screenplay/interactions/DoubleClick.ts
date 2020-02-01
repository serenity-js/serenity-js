import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { BrowseTheWeb } from '../abilities';
import { withAnswerOf } from '../withAnswerOf';

export class DoubleClick extends Interaction {
    static on(target: Question<ElementFinder> | ElementFinder): Interaction {
        return new DoubleClick(target);
    }

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        // Since the deprecation of Webdriver's ControlFlow,
        // Protractor's doubleClick might behave incorrectly when promises are used.
        // The mouseMove/doubleClick combo works around that problem.
        // See https://github.com/angular/protractor/issues/4578

        return withAnswerOf(actor, this.target, (elf: ElementFinder) =>
            BrowseTheWeb.as(actor).actions()
                .mouseMove(elf)
                .perform()
                .then(() => BrowseTheWeb.as(actor).actions().doubleClick().perform()));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor double-clicks on ${ this.target }`;
    }
}
