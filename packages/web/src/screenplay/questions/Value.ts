import { Answerable, AnswersQuestions, d, MetaQuestion, Question, UsesAbilities } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * @desc
 *  Returns the `value` attribute of a given {@link WebElement},
 *  represented by Answerable<{@link @wdio/types~Element}>
 *
 * @example <caption>Example widget</caption>
 *  <input type="text" id="username" value="Alice" />
 *
 * @example <caption>Retrieve CSS classes of a given WebElement</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { BrowseTheWeb, by, Value, Target } from '@serenity-js/webdriverio';
 *
 *  const usernameField = () =>
 *      Target.the('username field').located(by.id('username'))
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWeb.using(browser))
 *      .attemptsTo(
 *          Ensure.that(Value.of(usernameField), equals('Alice')),
 *      )
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 * @implements {@serenity-js/core/lib/screenplay/questions~MetaQuestion}
 */
export class Value
    extends Question<Promise<string>>
    implements MetaQuestion<Answerable<PageElement>, Promise<string>>
{
    /**
     * @private
     */
    private subject: string;

    /**
     * @param {Answerable<PageElement>} element
     * @returns {Value}
     */
    static of(element: Answerable<PageElement>): Question<Promise<string>> & MetaQuestion<Answerable<PageElement>, Promise<string>> {
        return new Value(element);
    }

    /**
     * @param {Answerable<PageElement>} element
     */
    constructor(private readonly element: Answerable<PageElement>) {
        super();
        this.subject = d`the value of ${ element }`;
    }

    /**
     * @desc
     *  Resolves to the value of a given [`input`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
     *  {@link WebElement}, located in the context of a `parent` element.
     *
     * @param {Answerable<PageElement>} parent
     * @returns {Question<Promise<string>>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    of(parent: Answerable<PageElement>): Question<Promise<string>> {
        return new Value(PageElement.of(this.element, parent));
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
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const element = await actor.answer(this.element);

        return element.value();
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
