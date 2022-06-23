import { Answerable } from '../Answerable';
import { Expectation } from '../questions';
import { WaitUntil } from './Wait';

/**
 * @desc
 *  Fluent interface to make the instantiation of the {@link Interaction} to {@link Wait} more readable.
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
     *  A {@link Question} that the {@link Actor}  will keep asking until the answer meets
     *  the {@link Expectation}, or the timeout expires.
     *
     * @param {Expectation<any,Actual>} expectation
     *  An {@link Expectation} to be met before proceeding
     *
     * @returns {Interaction}
     */
    until: <Actual>(actual: Answerable<Actual>, expectation: Expectation<Actual>) => WaitUntil<Actual>;
}
