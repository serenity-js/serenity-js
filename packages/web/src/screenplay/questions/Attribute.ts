import { Answerable, AnswersQuestions, d, LogicError, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';

import { PageElement } from '../models';

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
 * @extends {@serenity-js/core/lib/screenplay~Question<Promise<string>>}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class Attribute
    extends Question<Promise<string>>
    implements MetaQuestion<Answerable<PageElement>, Promise<string>>
{
    /**
     * @private
     */
    private subject: string;

    /**
     * @param {Answerable<string>} name
     * @returns {Attribute}
     */
    static called(name: Answerable<string>): Attribute {
        return new Attribute(name);
    }

    /**
     * @param {Answerable<string>} name
     * @param {@serenity-js/core/lib/screenplay~Answerable<Element>} [element]
     */
    protected constructor(
        private readonly name: Answerable<string>,
        private readonly element?: Answerable<PageElement>,
    ) {
        super();
        this.subject = element
            ? d`${ name } attribute of ${ element }`
            : d`${ name } attribute`
    }

    /**
     * @desc
     *  Resolves to the value of an HTML attribute of the `target` element,
     *  located in the context of a `parent` element.
     *
     * @param {Answerable<PageElement>} parent
     * @returns {Question<Promise<string[]>>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    of(parent: Answerable<PageElement>): Question<Promise<string>> {
        return new Attribute(
            this.name,
            this.element
                ? PageElement.of(this.element, parent)
                : parent
        );
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const name = await actor.answer(this.name);

        if (! this.element) {
            throw new LogicError(d`Couldn't read attribute ${ name } of an unspecified page element.`);
        }

        const element = await actor.answer(this.element);

        return element.attribute(name);
    }

    /**
     * @desc
     *  Changes the description of this question's subject.
     *
     * @param {string} subject
     * @returns {Question<T>}
     */
    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    /**
     * @returns {string}
     *  Returns a human-readable representation of this {@link @serenity-js/core/lib/screenplay~Question}.
     */
    toString(): string {
        return this.subject;
    }
}
