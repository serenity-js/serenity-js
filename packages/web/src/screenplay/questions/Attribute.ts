import type { Answerable, AnswersQuestions, MetaQuestion, MetaQuestionAdapter, Optional, QuestionAdapter, UsesAbilities } from '@serenity-js/core';
import { d, LogicError, Question, the } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * Uses the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
 * the value of the specified HTML attribute of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
 *
 * ## Example widget
 *
 * ```html
 * <ul id="shopping-list" data-items-left="2">
 *   <li data-state="bought">Coffee<li>
 *   <li data-state="buy">Honey<li>
 *   <li data-state="buy">Chocolate<li>
 * </ul>
 * ```
 *
 * ## Retrieve an HTML attribute of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { Attribute, By, PageElement } from '@serenity-js/web'
 *
 * const shoppingList = () =>
 *   PageElement.located(By.id('shopping-list'))
 *     .describedAs('shopping list')
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(
 *       Attribute.called('data-items-left').of(shoppingList()),
 *       equals('2')
 *     ),
 *   )
 * ```
 *
 * ## Using `Attribute` as [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter)
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { Attribute, By, PageElement } from '@serenity-js/web'
 *
 * const shoppingList = () =>
 *   PageElement.located(By.css('#shopping-list'))
 *     .describedAs('shopping list')
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(
 *       Attribute.called('id').of(shoppingList()).toLocaleUpperCase(),
 *       equals('SHOPPING-LIST')
 *     ),
 * )
 * ```
 *
 * ## Using as filter in [Page Element Query Language](https://serenity-js.org/handbook/web-testing/page-element-query-language/)
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, includes } from '@serenity-js/assertions'
 * import { Attribute, By, PageElements } from '@serenity-js/web'
 *
 * class ShoppingList {
 *   static items = () =>
 *     PageElements.located(By.css('#shopping-list li'))
 *       .describedAs('items')
 *
 *   static outstandingItems = () =>
 *     ShoppingList.items()
 *       .where(
 *         Attribute.called('data-state'),
 *         includes('buy')
 *       )
 * }
 *
 * await actorCalled('Lisa')
 * .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 * .attemptsTo(
 *   Ensure.that(
 *     Text.ofAll(ShoppingList.outstandingItems()),
 *     equals([ 'Honey', 'Chocolate' ])
 *   ),
 * )
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
export class Attribute<Native_Element_Type>
    extends Question<Promise<string>>
    implements MetaQuestion<PageElement<Native_Element_Type>, Question<Promise<string>>>, Optional
{
    /**
     * Instantiates a [`Question`](https://serenity-js.org/api/core/class/Question/) that uses
     * the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
     * the value of the specified HTML attribute of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
     *
     * @param name
     *  The name of the attribute to retrieve
     */
    static called<NET = any>(name: Answerable<string>): Attribute<NET> {
        return new Attribute(name);
    }

    protected constructor(
        private readonly name: Answerable<string>,
        private readonly element?: QuestionAdapter<PageElement> | PageElement,
    ) {
        super(element
            ? the`${ name } attribute of ${ element }`
            : the`${ name } attribute`
        );
    }

    /**
     * Resolves to the value of an HTML attribute of the `pageElement`.
     *
     * #### Learn more
     * - [`MetaQuestion`](https://serenity-js.org/api/core/interface/MetaQuestion/)
     *
     * @param pageElement
     */
    of(pageElement: QuestionAdapter<PageElement<Native_Element_Type>> | PageElement<Native_Element_Type>): MetaQuestionAdapter<PageElement<Native_Element_Type>, string> {
        return Question.createAdapter(
            new Attribute(
                this.name,
                this.element
                    ? PageElement.of(this.element, pageElement)
                    : pageElement
            )
        ) as MetaQuestionAdapter<PageElement, string>;
    }

    /**
     * @inheritDoc
     */
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const name = await actor.answer(this.name);

        if (! this.element) {
            throw new LogicError(d`Couldn't read attribute ${ name } of an unspecified page element`);
        }

        const element = await actor.answer(this.element);

        return element.attribute(name);
    }

    /**
     * @inheritDoc
     */
    isPresent(): QuestionAdapter<boolean> {
        return Question.about(this.toString(), async actor => {
            const attribute = await this.answeredBy(actor);
            return attribute !== null && attribute !== undefined;
        });
    }
}
