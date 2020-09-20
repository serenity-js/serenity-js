import { Answerable, AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { withAnswerOf } from '../withAnswerOf';

export class Attribute extends Question<Promise<string>> {
    static of(target: Question<ElementFinder> | ElementFinder) {
        return {
            called: (name: Answerable<string>) => new Attribute(target, name),
        };
    }

    constructor(
        private readonly target: Question<ElementFinder> | ElementFinder,
        private readonly name: Answerable<string>,
    ) {
        super(formatted `the value of the ${ name } attribute of ${ target}`);
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return actor.answer(this.name)
            .then(name => withAnswerOf(actor, this.target, elf => elf.getAttribute(name)));
    }
}
