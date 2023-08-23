import type { Answerable,MetaQuestionAdapter, QuestionAdapter } from '@serenity-js/core';
import { d, Question } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
 * a list of [CSS classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class)
 * of a given {@apilink PageElement}.
 *
 * ## Example widget
 *
 * ```html
 * <ul id="shopping-list" class="active favourite">
 *   <li class="bought">Coffee<li>
 *   <li class="buy">Honey<li>
 *   <li class="buy">Chocolate<li>
 * </ul>
 * ```
 *
 * ## Retrieve CSS classes of a given {@apilink PageElement}
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { By, CssClasses, PageElement } from '@serenity-js/web'
 *
 * const shoppingList = () =>
 *   PageElement.located(By.css('#shopping-list'))
 *     .describedAs('shopping list')
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(
 *       CssClasses.of(shoppingList()),
 *       equals([ 'active', 'favourite' ])
 *     ),
 *   )
 * ```
 *
 * ## Using CssClasses as {@apilink QuestionAdapter}
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { By, CssClasses, PageElement } from '@serenity-js/web'
 *
 * const shoppingList = () =>
 *   PageElement.located(By.css('#shopping-list'))
 *     .describedAs('shopping list')
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(
 *       CssClasses.of(shoppingList()).length,
 *       equals(2)
 *     ),
 *     Ensure.that(
 *       CssClasses.of(shoppingList())[0],
 *       equals('active')
 *     ),
 *   )
 * ```
 *
 * ## Using as filter in {@apilink PageElements|Page Element Query Language}
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, contain } from '@serenity-js/assertions'
 * import { By, CssClasses, PageElement } from '@serenity-js/web'
 *
 * class ShoppingList {
 *   static items = () =>
 *     PageElements.located(By.css('#shopping-list li'))
 *       .describedAs('items')
 *
 *   static outstandingItems = () =>
 *     ShoppingList.items()
 *       .where(CssClasses, contain('buy'))
 * }
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(
 *       Text.ofAll(ShoppingList.outstandingItems()),
 *       equals([ 'Honey', 'Chocolate' ])
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
export class CssClasses {

    /**
     * Instantiates a {@apilink Question} that uses
     * the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
     * a list of [CSS classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class)
     * of a given {@apilink PageElement}.
     *
     * #### Learn more
     * - {@apilink MetaQuestion}
     *
     * @param pageElement
     */
    static of(pageElement: QuestionAdapter<PageElement> | PageElement): MetaQuestionAdapter<PageElement, string[]> {
        return Question.about(d`CSS classes of ${ pageElement }`,
            async actor => {
                const element = await actor.answer(pageElement);

                return element.attribute('class')
                    .then(attribute => attribute ?? '')
                    .then(attribute => attribute
                        .replace(/\s+/, ' ')
                        .trim()
                        .split(' ')
                        .filter(cssClass => !! cssClass),
                    );
            },
            (parent: Answerable<PageElement>) =>
                CssClasses.of(PageElement.of(pageElement, parent))
        );
    }
}
