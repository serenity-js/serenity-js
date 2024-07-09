import type {
    Answerable,
    AnswersQuestions,
    MetaQuestion,
    MetaQuestionAdapter,
    QuestionAdapter,
    UsesAbilities
} from '@serenity-js/core';
import { d, LogicError, Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';
import { PageElement } from '../models';

/**
 * Uses the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
 * the value of the specified computed style property of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
 *
 * ## Example widget
 *
 * ```html
 * <ul id="shopping-list" style="display: block">
 *   <li style="display: block">Coffee<li>
 *   <li style="display: none">Honey<li>
 *   <li style="display: block">Chocolate<li>
 * </ul>
 * ```
 *
 * ## Retrieve a computed style property of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { ComputedStyle, By, PageElement } from '@serenity-js/web'
 *
 * const shoppingList = () =>
 *   PageElement.located(By.id('shopping-list'))
 *      .describedAs('shopping list')
 *
 * await actorCalled('Lisa').attemptsTo(
 *   Ensure.that(
 *     ComputedStyle.called('display').of(shoppingList()),
 *     equals('block')
 *   ),
 * )
 * ```
 *
 * ## Using `ComputedStyle` as [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter)
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
 * await actorCalled('Lisa').attemptsTo(
 *   Ensure.that(
 *     ComputedStyle.called('display').of(shoppingList()).toLocaleUpperCase(),
 *     equals('BLOCK')
 *   ),
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
 *         ComputedStyle.called('display'),
 *         equals('block')
 *       )
 * }
 *
 * await actorCalled('Lisa')
 *  .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *  .attemptsTo(
 *    Ensure.that(
 *      Text.ofAll(ShoppingList.outstandingItems()),
 *      equals([ 'Honey', 'Chocolate' ])
 *    ),
 *  )
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
export class ComputedStyle<Native_Element_Type>
    extends Question<Promise<string>>
    implements MetaQuestion<PageElement<Native_Element_Type>, Question<Promise<string>>>
{
    /**
     * Instantiates a [`Question`](https://serenity-js.org/api/core/class/Question/) that uses
     * the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
     * the value of the specified computed style property of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
     *
     * @param name
     *  The name of the computed style property to retrieve
     */
    static called<NET = any>(name: Answerable<string>): ComputedStyle<NET> {
        return new ComputedStyle<NET>(name);
    }

    protected constructor(
        private readonly name: Answerable<string>,
        private readonly element?: QuestionAdapter<PageElement<Native_Element_Type>> | PageElement<Native_Element_Type>,
        private readonly pseudoElement?: Answerable<string>,
    ) {
        super([
            d`computed style property ${ name }`,
            pseudoElement && d`of pseudo-element ${ pseudoElement }`,
            element && d`of ${ element }`,
        ].filter(Boolean).join(' '));
    }

    /**
     * Instantiates a [`Question`](https://serenity-js.org/api/core/class/Question/) that uses
     * the [actor's](https://serenity-js.org/api/core/class/Actor/) [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/) to retrieve
     * the value of the specified computed style property of the specified pseudo-element of a given [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
     *
     * @param pseudoElement
     *  The pseudo-element to retrieve the computed style property from, such as `::before` or `::after`
     */
    ofPseudoElement(pseudoElement: Answerable<string>): MetaQuestionAdapter<PageElement<Native_Element_Type>, string> {
        return Question.createAdapter(
            new ComputedStyle<Native_Element_Type>(
                this.name,
                this.element,
                pseudoElement,
            )
        ) as MetaQuestionAdapter<PageElement<Native_Element_Type>, string>;
    }

    /**
     * Resolves to the value of a computed style property of the `pageElement`.
     *
     * #### Learn more
     * - [`MetaQuestion`](https://serenity-js.org/api/core/interface/MetaQuestion/)
     *
     * @param pageElement
     */
    of(pageElement: QuestionAdapter<PageElement<Native_Element_Type>> | PageElement<Native_Element_Type>): MetaQuestionAdapter<PageElement<Native_Element_Type>, string> {
        return Question.createAdapter(
            new ComputedStyle<Native_Element_Type>(
                this.name,
                this.element
                    ? PageElement.of(this.element, pageElement)
                    : pageElement,
                this.pseudoElement,
            )
        ) as MetaQuestionAdapter<PageElement<Native_Element_Type>, string>;
    }

    /**
     * @inheritDoc
     */
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const name = await actor.answer(this.name);

        if (! this.element) {
            throw new LogicError(d`Couldn't read computed style property ${ name } of an unspecified page element`);
        }

        const element = await actor.answer(this.element);
        const pseudoElement = await actor.answer(this.pseudoElement);

        const page = await BrowseTheWeb.as(actor).currentPage();

        return page.executeScript('return window.getComputedStyle(arguments[0], arguments[1]).getPropertyValue(arguments[2])', element, pseudoElement, name);
    }
}
