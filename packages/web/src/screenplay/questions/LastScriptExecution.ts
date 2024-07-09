import type { QuestionAdapter } from '@serenity-js/core';
import { Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';

/**
 * Uses the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
 * a returns the result of the last script executed via [`ExecuteScript`](https://serenity-js.org/api/web/class/ExecuteScript/).
 *
 * ## Executing a script and reading the result
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { ExecuteScript, LastScriptExecution } from '@serenity-js/web'
 * import { Ensure, includes } from '@serenity-js/assertions'
 *
 * await actorCalled('Joseph')
 *   .attemptsTo(
 *     ExecuteScript.sync(() => navigator.userAgent),
 *     Ensure.that(LastScriptExecution.result<string>(), includes('Chrome')),
 *   )
 * ```
 *
 * ## Using LastScriptExecution as [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter)
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { ExecuteScript, LastScriptExecution } from '@serenity-js/web'
 * import { Ensure, includes } from '@serenity-js/assertions'
 *
 * await actorCalled('Joseph')
 *   .attemptsTo(
 *     ExecuteScript.sync(() => navigator.userAgent),
 *     Ensure.that(
 *       LastScriptExecution.result<string>().toLocaleLowerCase(),
 *       includes('chrome')
 *     ),
 *   )
 * ```
 *
 * ## Learn more
 * - [`ExecuteScript`](https://serenity-js.org/api/web/class/ExecuteScript/)
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter)
 *
 * @group Questions
 */
export class LastScriptExecution {

    /**
     * Enables asserting on the result of a function executed via [`ExecuteScript`](https://serenity-js.org/api/web/class/ExecuteScript/).
     */
    static result<R>(): QuestionAdapter<R> {
        return Question.about(`last script execution result`, async actor => {
            const page = await BrowseTheWeb.as(actor).currentPage();
            return page.lastScriptExecutionResult<R>();
        })
    }
}
