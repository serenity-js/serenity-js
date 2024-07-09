import type { Answerable, AnswersQuestions} from '@serenity-js/core';
import { d, Interaction, LogicError } from '@serenity-js/core';
import type { FileSystemLocation } from '@serenity-js/core/lib/io';

import type { PageElement } from '../models';

/**
 * A base class for interactions with [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) objects.
 *
 * **Note:** The recommended way to implement custom interactions
 * in your code is to use the [`Interaction.where`](https://serenity-js.org/api/core/class/Interaction/#where) factory method.
 *
 * @group Activities
 */
export abstract class PageElementInteraction extends Interaction {

    protected constructor(description: Answerable<string>, location: FileSystemLocation = Interaction.callerLocation(4)) {
        super(description, location);
    }

    /**
     * Returns the resolved [`PageElement`](https://serenity-js.org/api/web/class/PageElement/), or throws a [`LogicError`](https://serenity-js.org/api/core/class/LogicError/)
     * if the element is `undefined`.
     *
     * @param actor
     * @param element
     */
    protected async resolve(
        actor: AnswersQuestions,
        element: Answerable<PageElement>,
    ): Promise<PageElement> {
        const resolved = await actor.answer(element);

        if (! resolved) {
            throw new LogicError(d `Couldn't find ${ element }`);
        }

        return resolved;
    }
}
