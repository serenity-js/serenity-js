import { Answerable, AnswersQuestions, d, MetaQuestion, Question, QuestionAdapter, UsesAbilities } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * @desc
 *  Retrieves the `value` attribute of a given {@link PageElement}.
 *
 * @example <caption>Example widget</caption>
 *  <input type="text" id="username" value="Alice" />
 *
 * @example <caption>Retrieve the `value` of a given PageElement</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { By, PageElement, Value } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  const usernameField = () =>
 *      PageElement.located(By.id('username')).describedAs('username field')
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *      .attemptsTo(
 *          Ensure.that(Value.of(usernameField), equals('Alice')),
 *      )
 *
 * @example <caption>Using Value as QuestionAdapter</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { By, PageElement, Value } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  const usernameField = () =>
 *      PageElement.located(By.id('username')).describedAs('username field')
 *
 *  actorCalled('Lisa')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *      .attemptsTo(
 *          Ensure.that(
 *              Value.of(usernameField).toLocaleLowerCase()[0],
 *              equals('a')  // [a]lice
 *          ),
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
     * @desc
     *  Retrieves the `value` attribute of a given {@link PageElement}.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<PageElement>} element
     * @returns {@serenity-js/core/lib/screenplay~QuestionAdapter<string>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/questions~MetaQuestion}
     */
    static of(element: Answerable<PageElement>): QuestionAdapter<string> & MetaQuestion<Answerable<PageElement>, Promise<string>> {
        return Question.createAdapter(new Value(element)) as QuestionAdapter<string> & MetaQuestion<Answerable<PageElement>, Promise<string>>;
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
     *  Retrieves the `value` attribute of a given {@link PageElement}.
     *  located within the `parent` element.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<PageElement>} parent
     * @returns {@serenity-js/core/lib/screenplay~QuestionAdapter<string>}
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
