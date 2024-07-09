import type { Answerable, MetaQuestionAdapter, QuestionAdapter } from '@serenity-js/core';
import { Question, the } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * Uses the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
 * a list of [CSS classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class)
 * of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
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
 * ## Retrieve CSS classes of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
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
 * ## Using CssClasses as [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter)
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
 * ## Using as filter in [Page Element Query Language](https://serenity-js.org/handbook/web-testing/page-element-query-language/)
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
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`MetaQuestion`](https://serenity-js.org/api/core/interface/MetaQuestion/)
 * - [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter)
 * - [`Question`](https://serenity-js.org/api/core/class/Question/)
 *
 * @group Questions
 */
export class CssClasses {

    /**
     * Instantiates a [`Question`](https://serenity-js.org/api/core/class/Question/) that uses
     * the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
     * a list of [CSS classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class)
     * of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
     *
     * #### Learn more
     * - [`MetaQuestion`](https://serenity-js.org/api/core/interface/MetaQuestion/)
     *
     * @param pageElement
     */
    static of(pageElement: QuestionAdapter<PageElement> | PageElement): MetaQuestionAdapter<PageElement, string[]> {
        return Question.about(the`CSS classes of ${ pageElement }`,
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
