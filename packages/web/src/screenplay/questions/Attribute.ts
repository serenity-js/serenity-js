import type { Answerable, AnswersQuestions, MetaQuestion, MetaQuestionAdapter, Optional, QuestionAdapter, UsesAbilities } from '@serenity-js/core';
import { d, LogicError, Question } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
 * the value of the specified HTML attribute of a given {@apilink PageElement}.
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
 * ## Retrieve an HTML attribute of a given {@apilink PageElement}
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
 * ## Using `Attribute` as {@apilink QuestionAdapter}
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
 * ## Using as filter in {@apilink PageElements|Page Element Query Language}
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
 * - {@apilink BrowseTheWeb}
 * - {@apilink MetaQuestion}
 * - {@apilink QuestionAdapter}
 * - {@apilink Question}
 *
 * @group Questions
 */
export class Attribute<Native_Element_Type>
    extends Question<Promise<string>>
    implements MetaQuestion<PageElement<Native_Element_Type>, Question<Promise<string>>>, Optional
{
    private subject: string;

    /**
     * Instantiates a {@apilink Question} that uses
     * the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
     * the value of the specified HTML attribute of a given {@apilink PageElement}.
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
        super();
        this.subject = element
            ? d`${ name } attribute of ${ element }`
            : d`${ name } attribute`
    }

    /**
     * Resolves to the value of an HTML attribute of the `pageElement`.
     *
     * #### Learn more
     * - {@apilink MetaQuestion}
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
        return Question.about(this.subject, async actor => {
            const attribute = await this.answeredBy(actor);
            return attribute !== null && attribute !== undefined;
        });
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
