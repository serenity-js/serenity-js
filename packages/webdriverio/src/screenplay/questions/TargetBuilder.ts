import { Locator } from './locators';

/**
 * @desc
 *  Fluent interface to make the instantiation of
 *  the {@link @serenity-js/core/lib/screenplay~Question}
 *  about a {@link Target} more readable.
 *
 * @see {@link Target}
 *
 * @interface
 */
export interface TargetBuilder<T> {

    /**
     * @desc
     *  Instantiates a {@link @serenity-js/core/lib/screenplay~Question}
     *  about a {@link Target}.
     *
     * @param {Locator} locator
     * @returns {@serenity-js/core/lib/screenplay~Question}
     *
     * @see {@link Target}
     * @see {@link Locator}
     */
    located: (locator: Locator) => T;
}
