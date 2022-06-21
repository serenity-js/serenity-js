import { Answerable, Interaction } from '@serenity-js/core';

import { PageElement } from '../models';

/**
 * @desc
 *  Fluent interface to make the instantiation of
 *  the {@link @serenity-js/core/lib/screenplay~Interaction}
 *  to {@link Scroll} more configurable.
 *
 * @see {@link Scroll}
 *
 * @interface
 */
export interface ScrollBuilder {

    /**
     * @desc
     *  Instantiates an {@link @serenity-js/core/lib/screenplay~Interaction}
     *  to {@link Scroll}.
     *
     * @param {Answerable<PageElement>} target
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link Target}
     */
    to(target: Answerable<PageElement>) : Interaction;
}
