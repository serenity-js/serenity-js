import { Answerable, AnswersQuestions, d, MetaQuestion, Question, QuestionAdapter, UsesAbilities } from '@serenity-js/core';
import { asyncMap } from '@serenity-js/core/lib/io';

import { PageElement, PageElements } from '../models';
import { ElementQuestion } from './ElementQuestion';

/**
 * @desc
 *  Resolves to the visible (i.e. not hidden by CSS) `innerText` of:
 *  - a given {@link WebElement}, represented by Answerable<{@link @wdio/types~Element}>
 *  - a group of {@link WebElement}s, represented by Answerable<{@link @wdio/types~ElementList}>
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
 *  import { BrowseTheWeb, by, CssClasses, Target, Text } from '@serenity-js/webdriverio';
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
 *              CssClasses.of(shoppingListItemCalled('Honey)),
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
     * @param {Answerable<PageElement>} element
     * @returns {Question<Promise<string>> & MetaQuestion<Answerable<PageElement>, Promise<string>>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    static of(element: Answerable<PageElement>):
        QuestionAdapter<string> &                                 // eslint-disable-line @typescript-eslint/indent
        MetaQuestion<Answerable<PageElement>, Promise<string>>    // eslint-disable-line @typescript-eslint/indent
    {
        return TextOfSingleElement.of(element);
    }

    /**
     * @desc
     *  Retrieves text of a group of {@link WebElement}s,
     *  represented by Answerable<{@link @wdio/types~ElementList}>
     *
     * @param {Answerable<PageElement[]>} elements
     * @returns {Question<Promise<string[]>> & MetaQuestion<Answerable<PageElement>, Promise<string[]>>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    static ofAll(elements: PageElements): QuestionAdapter<string[]> & MetaQuestion<Answerable<PageElement>, Promise<string[]>>
    static ofAll(elements: Answerable<PageElement[]>): QuestionAdapter<string[]>
    static ofAll(elements: PageElements | Answerable<PageElement[]>): QuestionAdapter<string[]> {
        if (elements instanceof PageElements) {
            return TextOfMultipleElements.of(elements);
        }

        return Question.about(d`the text of ${ elements }`, async actor => {
            const pageElements: PageElement[] = await actor.answer(elements);

            return asyncMap(pageElements, element => element.text());
        });
    }
}

class TextOfSingleElement
    extends ElementQuestion<Promise<string>>
    implements MetaQuestion<Answerable<PageElement>, Promise<string>>
{
    static of(element: Answerable<PageElement>): QuestionAdapter<string> & MetaQuestion<Answerable<PageElement>, Promise<string>> {
        return Question.createAdapter(new TextOfSingleElement(element)) as QuestionAdapter<string> & MetaQuestion<Answerable<PageElement>, Promise<string>>;
    }

    constructor(private readonly element: Answerable<PageElement>) {
        super(`the text of ${ element }`);
    }

    of(parent: Answerable<PageElement>): Question<Promise<string>> {
        return new TextOfSingleElement(PageElement.of(this.element, parent));
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const element = await actor.answer(this.element);

        return element.text();
    }
}

class TextOfMultipleElements
    extends ElementQuestion<Promise<string[]>>
    implements MetaQuestion<Answerable<PageElement>, Promise<string[]>>
{
    static of(elements: PageElements): QuestionAdapter<string[]> & MetaQuestion<Answerable<PageElement>, Promise<string[]>> {
        return Question.createAdapter(new TextOfMultipleElements(elements)) as QuestionAdapter<string[]> & MetaQuestion<Answerable<PageElement>, Promise<string[]>>;
    }

    constructor(private readonly elements: PageElements) {
        super(d`the text of ${ elements }`);
    }

    of(parent: Answerable<PageElement>): Question<Promise<string[]>> {
        return new TextOfMultipleElements(this.elements.of(parent));
    }

    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        const elements: PageElement[] = await actor.answer(this.elements);

        return asyncMap(elements, element => element.text());
    }
}
