import { Answerable, AnswersQuestions, LogicError, Question } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { Element, ElementList } from '../../ui';

/**
 * @desc
 *  A base class for questions about {@link Element}s.
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 */
export abstract class ElementQuestion<T>
    extends Question<T>
{
    /**
     * @desc
     *  Returns the resolved {@link Element}, or throws a {@link @serenity-js/core/lib/errors~LogicError}
     *  if the element is `undefined`.
     *
     * @param {@serenity-js/core/lib/screenplay/actor~AnswersQuestions} actor
     * @param {@serenity-js/core/lib/screenplay~Answerable<Element|ElementList>} element
     *
     * @returns {Promise<Element|ElementList>}
     *
     * @protected
     */
    protected async resolve<T=Element|ElementList>(
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
