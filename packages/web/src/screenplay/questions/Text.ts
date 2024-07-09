import type { Answerable, AnswersQuestions, MetaQuestionAdapter, QuestionAdapter } from '@serenity-js/core';
import { Question, the } from '@serenity-js/core';
import { asyncMap } from '@serenity-js/core/lib/io';

import type { PageElements } from '../models';
import { PageElement } from '../models';

/**
 * Uses the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
 * the visible (i.e. not hidden by CSS) [`innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText) of:
 * - a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 * - a group of [`PageElement`](https://serenity-js.org/api/web/class/PageElements/)
 *
 * The result includes the visible text of any sub-elements, without any leading or trailing whitespace.
 *
 * ## Example widget
 *
 * ```html
 * <h1>Shopping list</h1>
 * <ul id="shopping-list">
 *   <li>Coffee<li>
 *   <li class="bought">Honey<li>
 *   <li>Chocolate<li>
 * </ul>
 * ```
 *
 * ## Retrieve text of a single [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { By, PageElement, Text } from '@serenity-js/web'
 *
 * const header = () =>
 *   PageElement.located(By.css('h1'))
 *     .describedAs('header')
 *
 * await actorCalled('Lisa')
 *   .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *   .attemptsTo(
 *     Ensure.that(Text.of(header()), equals('Shopping list')),
 *   )
 * ```
 *
 * ## Retrieve text of multiple [`PageElement`](https://serenity-js.org/api/web/class/PageElements/)
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { By, PageElement, Text } from '@serenity-js/web'
 *
 * const shoppingListItems = () =>
 *   PageElements.located(By.css('#shopping-list li'))
 *     .describedAs('shopping list items')
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(
 *       Text.ofAll(shoppingListItems()),
 *       equals([ 'Coffee', 'Honey', 'Chocolate' ])
 *     ),
 *   )
 * ```
 *
 * ## Using as filter in [Page Element Query Language](https://serenity-js.org/handbook/web-testing/page-element-query-language/)
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { contain, Ensure } from '@serenity-js/assertions'
 * import { By, CssClasses, PageElement, Text } from '@serenity-js/web'
 *
 * const shoppingListItemCalled = (name: string) =>
 *   PageElements.located(By.css('#shopping-list li'))
 *     .describedAs('shopping list items')
 *     .where(Text, equals(name))
 *     .first()
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(
 *       CssClasses.of(shoppingListItemCalled('Honey)),
 *       contain('bought')
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
export class Text {

    /**
     * Instantiates a [`Question`](https://serenity-js.org/api/core/class/Question/) that uses
     * the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
     * the text of a single [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
     *
     * #### Learn more
     * - [`MetaQuestion`](https://serenity-js.org/api/core/interface/MetaQuestion/)
     *
     * @param pageElement
     */
    static of(pageElement: QuestionAdapter<PageElement> | PageElement): MetaQuestionAdapter<PageElement, string> {
        return Question.about(the`the text of ${ pageElement }`,
            async actor => {
                const element = await actor.answer(pageElement);

                return element.text();
            },
            (parent: Answerable<PageElement>) =>
                Text.of(PageElement.of(pageElement, parent))
        );
    }

    /**
     * Instantiates a [`Question`](https://serenity-js.org/api/core/class/Question/) that uses
     * the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
     * the text of a group of [`PageElement`](https://serenity-js.org/api/web/class/PageElements/).
     *
     * #### Learn more
     * - [`MetaQuestion`](https://serenity-js.org/api/core/interface/MetaQuestion/)
     *
     * @param pageElements
     */
    static ofAll(pageElements: PageElements): MetaQuestionAdapter<PageElement, string[]>
    static ofAll(pageElements: Answerable<PageElement[]>): QuestionAdapter<string[]>
    static ofAll(pageElements: PageElements | Answerable<PageElement[]>): QuestionAdapter<string[]> {
        if (Question.isAMetaQuestion(pageElements)) {
            return Question.about(the`the text of ${ pageElements }`,
                textOfMultiple(pageElements),
                (parent: Answerable<PageElement>) =>
                    Text.ofAll(pageElements.of(parent))
            );
        }

        return Question.about(the`the text of ${ pageElements }`, textOfMultiple(pageElements));
    }
}

function textOfMultiple(pageElements: Answerable<PageElement[]>) {
    return async (actor: AnswersQuestions) => {
        const elements: PageElement[] = await actor.answer(pageElements);
        return asyncMap(elements, element => element.text());
    }
}
