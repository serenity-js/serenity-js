import { Answerable } from '@serenity-js/core';
import { Interaction } from '@serenity-js/core/lib/screenplay';

import { PageElement } from '../models';

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
     * @param {Answerable<PageElement>} field
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link Target}
     */
    in: (field: Answerable<PageElement> /* | Question<AlertPromise> | AlertPromise */) => Interaction;
}
