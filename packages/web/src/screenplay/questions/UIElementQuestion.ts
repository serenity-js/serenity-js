import { Answerable, AnswersQuestions, LogicError, Question } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { UIElement, UIElementList } from '../../ui';

/**
 * @desc
 *  A base class for questions about {@link UIElement}s.
 *
 * @extends {@serenity-js/core/lib/screenplay~Question}
 */
export abstract class UIElementQuestion<T>
    extends Question<T>
{
    /**
     * @desc
     *  Returns the resolved {@link UIElement}, or throws a {@link @serenity-js/core/lib/errors~LogicError}
     *  if the element is `undefined`.
     *
     * @param {@serenity-js/core/lib/screenplay/actor~AnswersQuestions} actor
     * @param {@serenity-js/core/lib/screenplay~Answerable<UIElement|UIElementList>} element
     *
     * @returns {Promise<UIElement|UIElementList>}
     *
     * @protected
     */
    protected async resolve<T=UIElement|UIElementList>(
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
