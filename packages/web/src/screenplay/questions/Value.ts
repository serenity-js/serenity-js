import type { AnswersQuestions, MetaQuestion, MetaQuestionAdapter,QuestionAdapter, UsesAbilities } from '@serenity-js/core';
import { d, Question } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
 * the `value` attribute of a given {@apilink PageElement}.
 *
 * ## Example widget
 * ```html
 * <input type="text" id="username" value="Alice" />
 * ```
 *
 * ## Retrieve the `value` of a given {@apilink PageElement}
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
 * ## Using Value as {@apilink QuestionAdapter}
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
 * - {@apilink BrowseTheWeb}
 * - {@apilink MetaQuestion}
 * - {@apilink QuestionAdapter}
 * - {@apilink Question}
 *
 * @group Questions
 */
export class Value
    extends Question<Promise<string>>
    implements MetaQuestion<PageElement, string>
{
    private subject: string;

    /**
     * Instantiates a {@apilink Question} that uses
     * the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
     * the `value` attribute of a given {@apilink PageElement}.
     *
     * #### Learn more
     * - {@apilink MetaQuestion}
     *
     * @param pageElement
     */
    static of(pageElement: QuestionAdapter<PageElement> | PageElement): MetaQuestionAdapter<PageElement, string> {
        return Question.createAdapter(new Value(pageElement)) as MetaQuestionAdapter<PageElement, string>;
    }

    protected constructor(private readonly element: QuestionAdapter<PageElement> | PageElement) {
        super();
        this.subject = d`the value of ${ element }`;
    }

    /**
     * Instantiates a {@apilink Question} that uses
     * the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
     * the `value` attribute of a given {@apilink PageElement}
     * located within the `parent` element.
     *
     * #### Learn more
     * - {@apilink MetaQuestion}
     *
     * @param parent
     */
    of(parent: QuestionAdapter<PageElement> | PageElement): Question<Promise<string>> {
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
