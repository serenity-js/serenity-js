import { Answerable } from '@serenity-js/core';
import { Interaction } from '@serenity-js/core/lib/screenplay';

import { UIElement } from '../../ui';

/**
 * @desc
 *  Fluent interface to make the instantiation of
 *  the {@link @serenity-js/core/lib/screenplay~Interaction}
 *  to {@link Press} more readable.
 *
 * @see {@link Press}
 *
 * @interface
 */
export interface PressBuilder {

    /**
     * @desc
     *  Instantiates an {@link @serenity-js/core/lib/screenplay~Interaction}
     *  to {@link Press}.
     *
     * @param {Answerable<UIElement>} field
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link Target}
     */
    in: (field: Answerable<UIElement> /* | Question<AlertPromise> | AlertPromise */) => Interaction;
}
