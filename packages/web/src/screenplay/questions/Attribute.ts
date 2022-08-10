import { Answerable, AnswersQuestions, d, LogicError, MetaQuestion, Question, QuestionAdapter, UsesAbilities } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * @desc
 *  Returns the value of the specified HTML attribute of a given {@link PageElement}.
 *
 * @example <caption>Example widget</caption>
 *  <ul id="shopping-list" data-items-left="2">
 *    <li data-state="bought">Coffee<li>
 *    <li data-state="buy">Honey<li>
 *    <li data-state="buy">Chocolate<li>
 *  </ul>
 *
 * @example <caption>Retrieve an HTML attribute of a given PageElement</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { Attribute, By, PageElement } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  const shoppingList = () =>
 *      PageElement.located(By.id('shopping-list')).describedAs('shopping list');
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *      .attemptsTo(
 *          Ensure.that(
 *              Attribute.called('data-items-left').of(shoppingList()),
 *              equals('2')
 *          ),
 *      )
 *
 * @example <caption>Using Attribute as QuestionAdapter</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { Attribute, By, PageElement } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  const shoppingList = () =>
 *      PageElement.located(By.css('#shopping-list')).describedAs('shopping list')
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *      .attemptsTo(
 *          Ensure.that(
 *              Attribute.called('id').of(shoppingList()).toLocaleUpperCase(),
 *              equals('SHOPPING-LIST')
 *          ),
 *      )
 *
 * @example <caption>Find PageElements with a given attribute</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, includes } from '@serenity-js/assertions';
 *  import { Attribute, By, PageElements } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  class ShoppingList {
 *      static items = () =>
 *          PageElements.located(By.css('#shopping-list li'))
 *              .describedAs('items');
 *
 *      static outstandingItems = () =>
 *          ShoppingList.items()
 *              .where(Attribute.called('data-state'), includes('buy'));
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
 * @group Questions
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
     *  located within the `parent` element.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<PageElement>} parent
     * @returns {@serenity-js/core/lib/screenplay~QuestionAdapter<string>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    of(parent: Answerable<PageElement>): QuestionAdapter<string> & MetaQuestion<Answerable<PageElement>, Promise<string>> {
        return Question.createAdapter(
            new Attribute(
                this.name,
                this.element
                    ? PageElement.of(this.element, parent)
                    : parent
            )
        ) as QuestionAdapter<string> & MetaQuestion<Answerable<PageElement>, Promise<string>>;
    }

    /**
     * @inheritDoc
     */
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const name = await actor.answer(this.name);

        if (! this.element) {
            throw new LogicError(d`Couldn't read attribute ${ name } of an unspecified page element.`);
        }

        const element = await actor.answer(this.element);

        return element.attribute(name);
    }

    /**
     * @inheritDoc
     */
    describedAs(subject: string): this {
        this.subject = subject;
        return this;
    }

    /**
     * @inheritDoc
     */
    toString(): string {
        return this.subject;
    }
}
