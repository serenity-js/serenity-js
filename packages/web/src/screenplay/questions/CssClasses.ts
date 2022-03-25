import { Answerable, AnswersQuestions, MetaQuestion, Question, QuestionAdapter, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { PageElement } from '../models';
import { ElementQuestion } from './ElementQuestion';

/**
 * @desc
 *  Resolves to an array of [CSS classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class)
 *  of a given {@link PageElement}.
 *
 * @example <caption>Example widget</caption>
 *  <ul id="shopping-list" class="active favourite">
 *    <li class="bought">Coffee<li>
 *    <li class="buy">Honey<li>
 *    <li class="buy">Chocolate<li>
 *  </ul>
 *
 * @example <caption>Retrieve CSS classes of a given PageElement</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { By, CssClasses, PageElement } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  const shoppingList = () =>
 *      PageElement.located(By.css('#shopping-list')).describedAs('shopping list')
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *      .attemptsTo(
 *          Ensure.that(
 *              CssClasses.of(shoppingList()),
 *              equals([ 'active', 'favourite' ])
 *          ),
 *      )
 *
 * @example <caption>Using CssClasses as QuestionAdapter</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { By, CssClasses, PageElement } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  const shoppingList = () =>
 *      PageElement.located(By.css('#shopping-list')).describedAs('shopping list')
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *      .attemptsTo(
 *          Ensure.that(
 *              CssClasses.of(shoppingList()).length,
 *              equals(2)
 *          ),
 *          Ensure.that(
 *              CssClasses.of(shoppingList())[0],
 *              equals('active')
 *          ),
 *      )
 *
 * @example <caption>Find PageElements with a given class</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, contain } from '@serenity-js/assertions';
 *  import { By, CssClasses, PageElement } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  class ShoppingList {
 *      static items = () =>
 *          PageElements.located(By.css('#shopping-list li'))
 *              .describedAs('items')
 *
 *      static outstandingItems = () =>
 *          ShoppingList.items()
 *              .where(CssClasses, contain('buy'))
 *  }
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
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
     * @param {@serenity-js/core/lib/screenplay~Answerable<PageElement>} pageElement
     * @returns {@serenity-js/core/lib/screenplay~QuestionAdapter<string[]>}
     *
     * @see {@link @serenity-js/core/lib/screenplay~QuestionAdapter<string[]>}
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    static of(pageElement: Answerable<PageElement>): QuestionAdapter<string[]> & MetaQuestion<Answerable<PageElement>, Promise<string[]>> {
        return Question.createAdapter(new CssClasses(pageElement)) as QuestionAdapter<string[]> & MetaQuestion<Answerable<PageElement>, Promise<string[]>>;
    }

    /**
     * @param {@serenity-js/core/lib/screenplay~Answerable<PageElement>} pageElement
     */
    protected constructor(private readonly pageElement: Answerable<PageElement>) {
        super(formatted `CSS classes of ${ pageElement}`);
    }

    /**
     * @desc
     *  Resolves to an array of CSS classes of the `pageElement`,
     *  located within the `parent` element.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<PageElement>} parent
     * @returns {Question<Promise<string[]>>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    of(parent: Answerable<PageElement>): Question<Promise<string[]>> {
        return new CssClasses(PageElement.of(this.pageElement, parent));
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
        const element = await this.resolve(actor, this.pageElement);

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
