import { Answerable, AnswersQuestions, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Element } from 'webdriverio';

import { Attribute } from './Attribute';
import { TargetNestedElement } from './targets';

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
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class CSSClasses
    extends Question<Promise<string[]>>
    implements MetaQuestion<Answerable<Element<'async'>>, Promise<string[]>>
{
    /**
     * @param {Question<Element<'async'>> | Element<'async'>} target
     * @returns {CSSClasses}
     */
    static of(target: Answerable<Element<'async'>>): CSSClasses {
        return new CSSClasses(target);
    }

    /**
     * @param {Question<Element<'async'>> | Element<'async'>} target
     */
    constructor(private readonly target: Answerable<Element<'async'>>) {
        super(formatted `CSS classes of ${ target}`);
    }

    /**
     * @desc
     *  Resolves to an array of CSS classes of the `target` element,
     *  located in the context of a `parent` element.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<Element<'async'>>} parent
     * @returns {Question<Promise<string[]>>}
     *
     * @see {@link Target.all}
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    of(parent: Answerable<Element<'async'>>): Question<Promise<string[]>> {
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
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        return Attribute.called('class').of(this.target).answeredBy(actor)
            .then(attribute => attribute
                .replace(/\s+/, ' ')
                .trim()
                .split(' ')
                .filter(cssClass => !! cssClass),
            );
    }
}
