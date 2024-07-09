import type { Answerable,MetaQuestionAdapter, QuestionAdapter } from '@serenity-js/core';
import { Question, the } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * Uses the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
 * the `value` attribute of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
 *
 * ## Example widget
 * ```html
 * <input type="text" id="username" value="Alice" />
 * ```
 *
 * ## Retrieve the `value` of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { By, PageElement, Value } from '@serenity-js/web'
 *
 * const usernameField = () =>
 *   PageElement.located(By.id('username'))
 *     .describedAs('username field')
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(Value.of(usernameField), equals('Alice')),
 *   )
 * ```
 *
 * ## Using Value as [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter)
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { By, PageElement, Value } from '@serenity-js/web'
 *
 * const usernameField = () =>
 *   PageElement.located(By.id('username'))
 *     .describedAs('username field')
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(
 *       Value.of(usernameField).toLocaleLowerCase()[0],
 *       equals('a')  // [a]lice
 *     ),
 *   )
 * ```
 *
 * ## Learn more
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`MetaQuestion`](https://serenity-js.org/api/core/interface/MetaQuestion/)
 * - [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter)
 * - [`Question`](https://serenity-js.org/api/core/class/Question/)
 *
 * @group Questions
 */
export class Value {

    /**
     * Instantiates a [`Question`](https://serenity-js.org/api/core/class/Question/) that uses
     * the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
     * the `value` attribute of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
     *
     * #### Learn more
     * - [`MetaQuestion`](https://serenity-js.org/api/core/interface/MetaQuestion/)
     *
     * @param pageElement
     */
    static of(pageElement: QuestionAdapter<PageElement> | PageElement): MetaQuestionAdapter<PageElement, string> {
        return Question.about(the`the value of ${ pageElement }`,
            async actor => {
                const element = await actor.answer(pageElement);
                return element.value();
            },
            (parent: Answerable<PageElement>) =>
                Value.of(PageElement.of(pageElement, parent))
        );
    }
}
