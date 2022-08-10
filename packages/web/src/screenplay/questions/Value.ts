import { Answerable, AnswersQuestions, d, MetaQuestion, Question, QuestionAdapter, UsesAbilities } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * Uses the {@link Actor|actor's} {@link Ability|ability} to {@link BrowseTheWeb} to retrieve
 * the `value` attribute of a given {@link PageElement}.
 *
 * ## Example widget
 * ```html
 * <input type="text" id="username" value="Alice" />
 * ```
 *
 * ## Retrieve the `value` of a given {@link PageElement}
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { By, PageElement, Value } from '@serenity-js/web'
 *
 * const usernameField = () =>
 *   PageElement.located(By.id('username'))
 *     .describedAs('username field')
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(Value.of(usernameField), equals('Alice')),
 *   )
 * ```
 *
 * ## Using Value as {@link QuestionAdapter}
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { By, PageElement, Value } from '@serenity-js/web'
 *
 * const usernameField = () =>
 *   PageElement.located(By.id('username'))
 *     .describedAs('username field')
 *
 * await actorCalled('Lisa')
 *   .attemptsTo(
 *     Ensure.that(
 *       Value.of(usernameField).toLocaleLowerCase()[0],
 *       equals('a')  // [a]lice
 *     ),
 *   )
 * ```
 *
 * ## Learn more
 * - {@link BrowseTheWeb}
 * - {@link MetaQuestion}
 * - {@link QuestionAdapter}
 * - {@link Question}
 *
 * @group Questions
 */
export class Value
    extends Question<Promise<string>>
    implements MetaQuestion<Answerable<PageElement>, Promise<string>>
{
    private subject: string;

    /**
     * Instantiates a {@link Question} that uses
     * the {@link Actor|actor's} {@link Ability|ability} to {@link BrowseTheWeb} to retrieve
     * the `value` attribute of a given {@link PageElement}.
     *
     * #### Learn more
     * - {@link MetaQuestion}
     *
     * @param pageElement
     */
    static of(pageElement: Answerable<PageElement>): QuestionAdapter<string> & MetaQuestion<Answerable<PageElement>, Promise<string>> {
        return Question.createAdapter(new Value(pageElement)) as QuestionAdapter<string> & MetaQuestion<Answerable<PageElement>, Promise<string>>;
    }

    protected constructor(private readonly element: Answerable<PageElement>) {
        super();
        this.subject = d`the value of ${ element }`;
    }

    /**
     * Instantiates a {@link Question} that uses
     * the {@link Actor|actor's} {@link Ability|ability} to {@link BrowseTheWeb} to retrieve
     * the `value` attribute of a given {@link PageElement}
     * located within the `parent` element.
     *
     * #### Learn more
     * - {@link MetaQuestion}
     *
     * @param parent
     */
    of(parent: Answerable<PageElement>): Question<Promise<string>> {
        return new Value(PageElement.of(this.element, parent));
    }

    /**
     * @inheritDoc
     */
    async answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const element = await actor.answer(this.element);

        return element.value();
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
