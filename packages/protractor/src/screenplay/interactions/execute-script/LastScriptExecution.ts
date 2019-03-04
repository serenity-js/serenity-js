import { Question } from '@serenity-js/core';
import { BrowseTheWeb } from '../../abilities';

export class LastScriptExecution {

    /**
     * @desc
     *  Enables asserting on the result of a function executed via {@link ExecuteScript}.
     *
     * @returns {Question<Promise<R>>}
     */
    static result<R>(): Question<Promise<R>> {
        return Question.about(`last script execution result`, actor =>
            BrowseTheWeb.as(actor).getLastScriptExecutionResult());
    }
}
