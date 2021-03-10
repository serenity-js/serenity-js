import { Answerable, Expectation } from '@serenity-js/core';
import { Interaction } from '@serenity-js/core/lib/screenplay';

/**
 * @desc
 *  Fluent interface to make the instantiation of
 *  the {@link @serenity-js/core/lib/screenplay~Interaction}
 *  to {@link Wait} more readable.
 *
 * @see {@link Wait}
 *
 * @interface
 */
export interface WaitBuilder {

    /**
     * @desc
     *  Instantiates an {@link @serenity-js/core/lib/screenplay~Interaction}
     *  to {@link Wait}.
     *
     * @param {Answerable<Actual>} actual
     *  A {@link @serenity-js/core/lib/screenplay~Question}
     *  that the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  will keep asking until the answer meets
     *  the {@link @serenity-js/core/lib/screenplay/questions~Expectation} provided
     *
     * @param {@serenity-js/core/lib/screenplay/questions~Expectation<any,Actual>} expectation
     *  An {@link @serenity-js/assertions~Expectation} to be met before proceeding
     *
     * @returns {Interaction}
     *
     * @see {@link Target}
     */
    until: <Actual>(actual: Answerable<Actual>, expectation: Expectation<any, Actual>) => Interaction;
}
