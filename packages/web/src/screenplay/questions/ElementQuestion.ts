import { Answerable, AnswersQuestions, LogicError, Question } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

/**
 * @desc
 *  A base class for questions about {@link PageElement}s.
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 */
// todo: remove
export abstract class ElementQuestion<T>
    extends Question<T>
{
    constructor(protected subject: string) {
        super();
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

    toString(): string {
        return this.subject;
    }

    /**
     * @desc
     *  Returns the resolved {@link PageElement}, or throws a {@link @serenity-js/core/lib/errors~LogicError}
     *  if the element is `undefined`.
     *
     * @param {@serenity-js/core/lib/screenplay/actor~AnswersQuestions} actor
     * @param {@serenity-js/core/lib/screenplay~Answerable<Element|ElementList>} element
     *
     * @returns {Promise<PageElement|PageElements>}
     *
     * @protected
     */
    protected async resolve<T>(
        actor: AnswersQuestions,
        element: Answerable<T>,
    ): Promise<T> {
        const resolved = await actor.answer(element);

        if (! resolved) {
            throw new LogicError(formatted `Couldn't find ${ element }`);
        }

        return resolved;
    }
}
