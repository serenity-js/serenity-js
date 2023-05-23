import { Answerable, AnswerQuestions, AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import type * as playwright from 'playwright-core';

export class AnswerQuestionsWithPlaywright extends AnswerQuestions {
    constructor(
        actor: AnswersQuestions & UsesAbilities,
        private readonly browser: playwright.Browser,
    ) {
        super(actor);
    }

    override answer<T>(answerable: Answerable<T>): Promise<T> {
        return this.browser['_wrapApiCall'](() => {
            return super.answer(answerable);
        })
    }
}
