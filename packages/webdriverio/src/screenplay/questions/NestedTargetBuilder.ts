import { Answerable } from '@serenity-js/core';
import type { Element } from 'webdriverio';

import { TargetBuilder } from './TargetBuilder';

/**
 * @desc
 *  Fluent interface to make the instantiation of
 *  the {@link @serenity-js/core/lib/screenplay~Question}
 *  about a nested {@link Target} more readable.
 *
 * @see {@link Target}
 *
 * @interface
 */
export interface NestedTargetBuilder<T> {

    /**
     * @desc
     *  Instantiates a {@link @serenity-js/core/lib/screenplay~Question}
     *  about a {@link Target}.
     *
     * @param {@serenity-js/core/lib/screenplay~Answerable<Element<'async'>>} parent
     * @returns {TargetBuilder}
     *
     * @see {@link Target}
     * @see {@link TargetBuilder}
     */
    of: (parent: Answerable<Element<'async'>>) => TargetBuilder<T>;
}
