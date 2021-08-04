import { Answerable, AnswersQuestions, LogicError, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { Element } from 'webdriverio';

import { TargetNestedElement } from './targets';

/**
 * @desc
 *  Returns the value of the given HTML attribute of a given {@link WebElement},
 *  represented by Answerable<{@link @wdio/types~Element}>
 *
 * @example <caption>Example widget</caption>
 *  <ul id="shopping-list" data-items-left="2">
 *    <li data-state="bought">Coffee<li>
 *    <li data-state="buy">Honey<li>
 *    <li data-state="buy">Chocolate<li>
 *  </ul>
 *
 * @example <caption>Retrieve a HTML attribute of a given WebElement</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { Attribute, by, BrowseTheWeb, Target } from '@serenity-js/webdriverio';
 *
 *  const shoppingList = () =>
 *      Target.the('shopping list').located(by.id('shopping-list'))
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Ensure.that(Attribute.called('data-items-left').of(shoppingList()), equals('2')),
 *      )
 *
 * @example <caption>Find WebElements with a given attribute</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, includes } from '@serenity-js/assertions';
 *  import { Attribute, BrowseTheWeb, by, Target } from '@serenity-js/webdriverio';
 *
 *  class ShoppingList {
 *      static items = () =>
 *          Target.all('items')
 *              .located(by.css('#shopping-list li'))
 *
 *      static outstandingItems = () =>
 *          ShoppingList.items
 *              .where(Attribute.called('data-state'), includes('buy'))
 *  }
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Ensure.that(
 *              Text.ofAll(ShoppingList.outstandingItems()),
 *              equals([ 'Honey', 'Chocolate' ])
 *          ),
 *      )
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class Attribute
    extends Question<Promise<string>>
    implements MetaQuestion<Answerable<Element<'async'>>, Promise<string>>
{
    /**
     * @param {Answerable<string>} name
     * @returns {Attribute}
     */
    static called(name: Answerable<string>): Attribute {
        return new Attribute(name);
    }

    /**
     * @param {Answerable<string>} name
     * @param {@serenity-js/core/lib/screenplay~Answerable<Element<'async'>>} [element]
     */
    constructor(
        private readonly name: Answerable<string>,
        private readonly element?: Answerable<Element<'async'>>,
    ) {
        super(`"${ name }" attribute of ${ element }`);
    }

    /**
     * @desc
     *  Resolves to the value of a HTML attribute of the `target` element,
     *  located in the context of a `parent` element.
     *
     * @param {Answerable<Element<'async'>>} parent
     * @returns {Question<Promise<string[]>>}
     *
     * @see {@link Target.all}
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    of(parent: Answerable<Element<'async'>>): Question<Promise<string>> {
        return new Attribute(
            this.name,
            this.element
                ? new TargetNestedElement(parent, this.element)
                : parent
        );
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        if (! this.element) {
            throw new LogicError(`Target not specified`);   // todo: better error message?
        }

        const element = await actor.answer(this.element);
        const name    = await actor.answer(this.name);

        return element.getAttribute(name);
    }
}
