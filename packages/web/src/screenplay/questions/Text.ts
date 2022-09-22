import { Answerable, AnswersQuestions, d, MetaQuestion, Question, QuestionAdapter, UsesAbilities } from '@serenity-js/core';
import { asyncMap } from '@serenity-js/core/lib/io';

import { PageElement, PageElements } from '../models';

/**
 * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
 * the visible (i.e. not hidden by CSS) [`innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText) of:
 * - a given {@apilink PageElement}
 * - a group of {@apilink PageElements}
 *
 * The result includes the visible text of any sub-elements, without any leading or trailing whitespace.
 *
 * ## Example widget
 *
 * ```html
 * <h1>Shopping list</h1>
 * <ul id="shopping-list">
 *   <li>Coffee<li>
 *   <li class="bought">Honey<li>
 *   <li>Chocolate<li>
 * </ul>
 * ```
 *
 * ## Retrieve text of a single {@apilink PageElement}
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { By, PageElement, Text } from '@serenity-js/web'
 *
 * const header = () =>
 *   PageElement.located(By.css('h1'))
 *     .describedAs('header')
 *
 * await actorCalled('Lisa')
 *   .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *   .attemptsTo(
 *     Ensure.that(Text.of(header()), equals('Shopping list')),
 *   )
 * ```
 *
 * ## Retrieve text of multiple {@apilink PageElements}
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { By, PageElement, Text } from '@serenity-js/web'
 *
 * const shoppingListItems = () =>
 *   PageElements.located(By.css('#shopping-list li'))
 *     .describedAs('shopping list items')
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(
 *       Text.ofAll(shoppingListItems()),
 *       equals([ 'Coffee', 'Honey', 'Chocolate' ])
 *     ),
 *   )
 * ```
 *
 * ## Using as filter in {@apilink PageElements|Page Element Query Language}
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { contain, Ensure } from '@serenity-js/assertions'
 * import { By, CssClasses, PageElement, Text } from '@serenity-js/web'
 *
 * const shoppingListItemCalled = (name: string) =>
 *   PageElements.located(By.css('#shopping-list li'))
 *     .describedAs('shopping list items')
 *     .where(Text, equals(name))
 *     .first()
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(
 *       CssClasses.of(shoppingListItemCalled('Honey)),
 *       contain('bought')
 *     ),
 *   )
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
export class Text {

    /**
     * Instantiates a {@apilink Question} that uses
     * the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
     * the text of a single {@apilink PageElement}.
     *
     * #### Learn more
     * - {@apilink MetaQuestion}
     *
     * @param pageElement
     */
    static of(pageElement: Answerable<PageElement>):
        QuestionAdapter<string> &                                 // eslint-disable-line @typescript-eslint/indent
        MetaQuestion<Answerable<PageElement>, Promise<string>>    // eslint-disable-line @typescript-eslint/indent
    {
        return TextOfSingleElement.of(pageElement);
    }

    /**
     * Instantiates a {@apilink Question} that uses
     * the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
     * the text of a group of {@apilink PageElements}.
     *
     * #### Learn more
     * - {@apilink MetaQuestion}
     *
     * @param pageElements
     */
    static ofAll(pageElements: PageElements): QuestionAdapter<string[]> & MetaQuestion<Answerable<PageElement>, Promise<string[]>>
    static ofAll(pageElements: Answerable<PageElement[]>): QuestionAdapter<string[]>
    static ofAll(pageElements: PageElements | Answerable<PageElement[]>): QuestionAdapter<string[]> {
        if (pageElements instanceof PageElements) {
            return TextOfMultipleElements.of(pageElements);
        }

        return Question.about(d`the text of ${ pageElements }`, async actor => {
            const elements: PageElement[] = await actor.answer(pageElements);

            return asyncMap(elements, element => element.text());
        });
    }
}

class TextOfSingleElement
    extends Question<Promise<string>>
    implements MetaQuestion<Answerable<PageElement>, Promise<string>>
{
    /**
     * @private
     */
    private subject: string;

    static of(element: Answerable<PageElement>): QuestionAdapter<string> & MetaQuestion<Answerable<PageElement>, Promise<string>> {
        return Question.createAdapter(new TextOfSingleElement(element)) as QuestionAdapter<string> & MetaQuestion<Answerable<PageElement>, Promise<string>>;
    }

    protected constructor(private readonly element: Answerable<PageElement>) {
        super();
        this.subject = d`the text of ${ element }`;
    }

    of(parent: Answerable<PageElement>): Question<Promise<string>> {
        return new TextOfSingleElement(PageElement.of(this.element, parent));
    }

    /**
     * @inheritDoc
     */
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const element = await actor.answer(this.element);

        return element.text();
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

class TextOfMultipleElements
    extends Question<Promise<string[]>>
    implements MetaQuestion<Answerable<PageElement>, Promise<string[]>>
{
    /**
     * @private
     */
    private subject: string;

    static of(elements: PageElements): QuestionAdapter<string[]> & MetaQuestion<Answerable<PageElement>, Promise<string[]>> {
        return Question.createAdapter(new TextOfMultipleElements(elements)) as QuestionAdapter<string[]> & MetaQuestion<Answerable<PageElement>, Promise<string[]>>;
    }

    protected constructor(private readonly elements: PageElements) {
        super();
        this.subject = d`the text of ${ elements }`;
    }

    of(parent: Answerable<PageElement>): Question<Promise<string[]>> {
        return new TextOfMultipleElements(this.elements.of(parent));
    }

    /**
     * @inheritDoc
     */
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        const elements: PageElement[] = await actor.answer(this.elements);

        return asyncMap(elements, element => element.text());
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
