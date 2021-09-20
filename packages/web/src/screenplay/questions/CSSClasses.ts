import { Answerable, AnswersQuestions, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { UIElement } from '../../ui';
import { TargetNestedElement } from './targets';
import { UIElementQuestion } from './UIElementQuestion';

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
 *  import { BrowseTheWeb, by, CSSClasses, Target } from '@serenity-js/webdriverio';
 *
 *  const shoppingList = () =>
 *      Target.the('shopping list').located(by.id('shopping-list'))
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Ensure.that(CSSClasses.of(shoppingList()), equals([ 'active', 'favourite' ])),
 *      )
 *
 * @example <caption>Find WebElements with a given class</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, contain } from '@serenity-js/assertions';
 *  import { BrowseTheWeb, by, CSSClasses, Target } from '@serenity-js/webdriverio';
 *
 *  class ShoppingList {
 *      static items = () =>
 *          Target.all('items')
 *              .located(by.css('#shopping-list li'))
 *
 *      static outstandingItems = () =>
 *          ShoppingList.items
 *              .where(CSSClasses, contain('buy'))
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
 * @extends {UIElementQuestion}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class CSSClasses
    extends UIElementQuestion<Promise<string[]>>
    implements MetaQuestion<Answerable<UIElement>, Promise<string[]>>
{
    /**
     * @param {Question<UIElement> | UIElement} target
     * @returns {CSSClasses}
     */
    static of(target: Answerable<UIElement>): CSSClasses {
        return new CSSClasses(target);
    }

    /**
     * @param {Question<UIElement> | UIElement} target
     */
    constructor(private readonly target: Answerable<UIElement>) {
        super(formatted `CSS classes of ${ target}`);
    }

    /**
     * @desc
     *  Resolves to an array of CSS classes of the `target` element,
     *  located in the context of a `parent` element.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<UIElement>} parent
     * @returns {Question<Promise<string[]>>}
     *
     * @see {@link Target.all}
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    of(parent: Answerable<UIElement>): Question<Promise<string[]>> {
        return new CSSClasses(new TargetNestedElement(parent, this.target));
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

        return element.getAttribute('class')
            .then(attribute => attribute ?? '')
            .then(attribute => attribute
                .replace(/\s+/, ' ')
                .trim()
                .split(' ')
                .filter(cssClass => !! cssClass),
            );
    }
}
