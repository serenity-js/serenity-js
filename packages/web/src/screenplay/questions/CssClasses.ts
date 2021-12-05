import { Answerable, AnswersQuestions, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { PageElement } from '../models';
import { ElementQuestion } from './ElementQuestion';

/**
 * @desc
 *  Resolves to an array of [CSS classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class)
 *  of a given {@link WebElement}, represented by Answerable<{@link @wdio/types~Element}>.
 *
 * @example <caption>Example widget</caption>
 *  <ul id="shopping-list" class="active favourite">
 *    <li class="bought">Coffee<li>
 *    <li class="buy">Honey<li>
 *    <li class="buy">Chocolate<li>
 *  </ul>
 *
 * @example <caption>Retrieve CSS classes of a given WebElement</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { BrowseTheWeb, by, CssClasses, Target } from '@serenity-js/webdriverio';
 *
 *  const shoppingList = () =>
 *      Target.the('shopping list').located(by.id('shopping-list'))
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Ensure.that(CssClasses.of(shoppingList()), equals([ 'active', 'favourite' ])),
 *      )
 *
 * @example <caption>Find WebElements with a given class</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, contain } from '@serenity-js/assertions';
 *  import { BrowseTheWeb, by, CssClasses, Target } from '@serenity-js/webdriverio';
 *
 *  class ShoppingList {
 *      static items = () =>
 *          Target.all('items')
 *              .located(by.css('#shopping-list li'))
 *
 *      static outstandingItems = () =>
 *          ShoppingList.items
 *              .where(CssClasses, contain('buy'))
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
 * @extends {ElementQuestion}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class CssClasses
    extends ElementQuestion<Promise<string[]>>
    implements MetaQuestion<Answerable<PageElement>, Promise<string[]>>
{
    /**
     * @param {Question<PageElement> | PageElement} target
     * @returns {CssClasses}
     */
    static of(target: Answerable<PageElement>): CssClasses {
        return new CssClasses(target);
    }

    /**
     * @param {Question<PageElement> | PageElement} target
     */
    constructor(private readonly target: Answerable<PageElement>) {
        super(formatted `CSS classes of ${ target}`);
    }

    /**
     * @desc
     *  Resolves to an array of CSS classes of the `target` element,
     *  located in the context of a `parent` element.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<Element>} parent
     * @returns {Question<Promise<string[]>>}
     *
     * @see {@link Target.all}
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    of(parent: Answerable<PageElement>): Question<Promise<string[]>> {
        return new CssClasses(PageElement.of(this.target, parent));
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        const element = await this.resolve(actor, this.target);

        return element.attribute('class')
            .then(attribute => attribute ?? '')
            .then(attribute => attribute
                .replace(/\s+/, ' ')
                .trim()
                .split(' ')
                .filter(cssClass => !! cssClass),
            );
    }
}
