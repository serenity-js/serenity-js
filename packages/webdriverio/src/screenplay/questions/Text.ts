import { Answerable, AnswersQuestions, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import type { Element, ElementArray } from 'webdriverio';

import { TargetNestedElement, TargetNestedElements } from './targets';

/**
 * @desc
 *  Resolves to the visible (i.e. not hidden by CSS) `innerText` of:
 *  - a given {@link WebElement}, represented by Answerable<{@link @wdio/types~Element}>
 *  - a group of {@link WebElement}s, represented by Answerable<{@link @wdio/types~ElementArray}>
 *
 *  The result includes the visible text of any sub-elements, without any leading or trailing whitespace.
 *
 * @example <caption>Example widget</caption>
 *  <h1>Shopping list</h1>
 *  <ul id="shopping-list">
 *    <li>Coffee<li>
 *    <li class="bought">Honey<li>
 *    <li>Chocolate<li>
 *  </ul>
 *
 * @example <caption>Retrieve text of a single element</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { BrowseTheWeb, by, Target, Text } from '@serenity-js/webdriverio';
 *
 *  const header = () =>
 *      Target.the('header').located(by.tagName('h1'))
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Ensure.that(Text.of(header()), equals('Shopping list')),
 *      )
 *
 * @example <caption>Retrieve text of a multiple elements</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { BrowseTheWeb, by, Target, Text } from '@serenity-js/webdriverio';
 *
 *  const shoppingListItems = () =>
 *      Target.the('shopping list items').located(by.css('#shopping-list li'))
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Ensure.that(
 *              Text.ofAll(shoppingListItems()),
 *              equals([ 'Coffee', 'Honey', 'Chocolate' ])
 *          ),
 *      )
 *
 * @example <caption>Find element with matching text</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { contain, Ensure } from '@serenity-js/assertions';
 *  import { BrowseTheWeb, by, CSSClasses, Target, Text } from '@serenity-js/webdriverio';
 *
 *  const shoppingListItemCalled = (name: string) =>
 *      Target.the('shopping list items').located(by.css('#shopping-list li'))
 *          .where(Text, equals(name))
 *          .first()
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Ensure.that(
 *              CSSClasses.of(shoppingListItemCalled('Honey)),
 *              contain('bought')
 *          ),
 *      )
 *
 * @public
 * @see {@link Target}
 */
export class Text {

    /**
     * @desc
     *  Retrieves text of a single {@link WebElement},
     *  represented by Answerable<{@link @wdio/types~Element}>.
     *
     * @param {Answerable<Element<'async'>>} element
     * @returns {Question<Promise<string>> & MetaQuestion<Answerable<Element<'async'>>, Promise<string>>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    static of(element: Answerable<Element<'async'>>): Question<Promise<string>> & MetaQuestion<Answerable<Element<'async'>>, Promise<string>> {
        return new TextOfSingleElement(element);
    }

    /**
     * @desc
     *  Retrieves text of a group of {@link WebElement}s,
     *  represented by Answerable<{@link @wdio/types~ElementArray}>
     *
     * @param {Answerable<ElementArray>} elements
     * @returns {Question<Promise<string[]>> & MetaQuestion<Answerable<Element<'async'>>, Promise<string[]>>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    static ofAll(elements: Answerable<ElementArray>): Question<Promise<string[]>> & MetaQuestion<Answerable<Element<'async'>>, Promise<string[]>> {
        return new TextOfMultipleElements(elements);
    }
}

class TextOfSingleElement
    extends Question<Promise<string>>
    implements MetaQuestion<Answerable<Element<'async'>>, Promise<string>>
{
    constructor(private readonly element: Answerable<Element<'async'>>) {
        super(`the text of ${ element }`);
    }

    of(parent: Answerable<Element<'async'>>): Question<Promise<string>> {
        return new TextOfSingleElement(new TargetNestedElement(parent, this.element));
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return actor.answer(this.element)
            .then(element => element.getText())
    }
}

class TextOfMultipleElements
    extends Question<Promise<string[]>>
    implements MetaQuestion<Answerable<Element<'async'>>, Promise<string[]>>
{
    constructor(private readonly elements: Answerable<ElementArray>) {
        super(`the text of ${ elements }`);
    }

    of(parent: Answerable<Element<'async'>>): Question<Promise<string[]>> {
        return new TextOfMultipleElements(new TargetNestedElements(parent, this.elements));
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        const elements = await actor.answer(this.elements);
        return Promise.all(elements.map(answer => answer.getText()));
    }
}
