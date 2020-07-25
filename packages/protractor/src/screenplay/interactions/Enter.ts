import { Answerable, AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { AlertPromise } from 'selenium-webdriver';
import { withAnswerOf } from '../withAnswerOf';

export class Enter extends Interaction {
    static theValue(value: Answerable<string | number>) {
        return {
            into: (field: Question<ElementFinder> | ElementFinder | Question<AlertPromise> | AlertPromise) =>
                new Enter(value, field),
        };
    }

    constructor(
        private readonly value: Answerable<string | number>,
        private readonly field: Question<ElementFinder> | ElementFinder | Question<AlertPromise> | AlertPromise,
    ) {
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
        return actor.answer(this.value)
            .then(value => withAnswerOf(actor, this.field, (el: ElementFinder | AlertPromise) =>
                el.sendKeys(`${ value }`))
            );
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor enters ${ this.value } into ${ this.field }`;
    }
}
