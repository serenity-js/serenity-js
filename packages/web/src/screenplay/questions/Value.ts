import type { Answerable,MetaQuestionAdapter, QuestionAdapter } from '@serenity-js/core';
import { d, Question } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
 * the `value` attribute of a given {@apilink PageElement}.
 *
 * ## Example widget
 * ```html
 * <input type="text" id="username" value="Alice" />
 * ```
 *
 * ## Retrieve the `value` of a given {@apilink PageElement}
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
 * ## Using Value as {@apilink QuestionAdapter}
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
 * - {@apilink BrowseTheWeb}
 * - {@apilink MetaQuestion}
 * - {@apilink QuestionAdapter}
 * - {@apilink Question}
 *
 * @group Questions
 */
export class Value {

    /**
     * Instantiates a {@apilink Question} that uses
     * the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
     * the `value` attribute of a given {@apilink PageElement}.
     *
     * #### Learn more
     * - {@apilink MetaQuestion}
     *
     * @param pageElement
     */
    static of(pageElement: QuestionAdapter<PageElement> | PageElement): MetaQuestionAdapter<PageElement, string> {
        return Question.about(d`the value of ${ pageElement }`,
            async actor => {
                const element = await actor.answer(pageElement);
                return element.value();
            },
            (parent: Answerable<PageElement>) =>
                Value.of(PageElement.of(pageElement, parent))
        );
    }
}
