import type { Order } from './Order.js';

/**
 * Information passed to the Reporter#jasmineStarted event.
 *
 * @see https://jasmine.github.io/api/edge/global.html#JasmineStartedInfo
 *
 * @package
 */
export interface JasmineStartedInfo {

    /** The total number of specs defined in this suite. */
    totalSpecsDefined: number;

    /** Information about the ordering (random or not) of this execution of the suite. */
    order: Order;
}
