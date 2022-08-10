import { Question, QuestionAdapter } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';

/**
 * Returns the result of last script executed via {@link ExecuteScript}
 *
 * @group Questions
 */
export class LastScriptExecution {

    /**
     * Enables asserting on the result of a function executed via {@link ExecuteScript}.
     */
    static result<R>(): QuestionAdapter<R> {
        return Question.about(`last script execution result`, async actor => {
            const page = await BrowseTheWeb.as(actor).currentPage();
            return page.lastScriptExecutionResult<R>();
        })
    }
}
