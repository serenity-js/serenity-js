import { Question, QuestionAdapter } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Returns the result of last script executed via {@link ExecuteScript}
 */
export class LastScriptExecution {

    /**
     * @desc
     *  Enables asserting on the result of a function executed via {@link ExecuteScript}.
     *
     * @returns {Question<R>}
     */
    static result<R>(): QuestionAdapter<R> {
        return Question.about(`last script execution result`, async actor => {
            const page = await BrowseTheWeb.as(actor).currentPage();
            return page.lastScriptExecutionResult<R>();
        })
    }
}
