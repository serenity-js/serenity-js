import { Answerable, Interaction } from '@serenity-js/core';

import { UIElement } from '../../ui';

/**
 * @desc
 *  Fluent interface to make the instantiation of
 *  the {@link @serenity-js/core/lib/screenplay~Interaction}
 *  to {@link Enter} more readable.
 *
 * @see {@link Enter}
 *
 * @interface
 */
export interface EnterBuilder {

    /**
     * @desc
     *  Instantiates an {@link @serenity-js/core/lib/screenplay~Interaction}
     *  to {@link Enter}.
     *
     * @param {Answerable<UIElement>} field
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link Target}
     */
    into: (field: Answerable<UIElement> /* | Question<AlertPromise> | AlertPromise */) => Interaction;
}
