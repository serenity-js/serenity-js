import { Question } from '@serenity-js/core';
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
    static result<R>(): Question<R> {
        return Question.about(`last script execution result`, actor =>
            BrowseTheWeb.as(actor).getLastScriptExecutionResult());
    }
}
