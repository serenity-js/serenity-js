import { Expectation } from './Expectation';
import { Order } from './Order';

/**
 * @desc
 *  Information passed to the Reporter#jasmineDone event.
 *
 * @package
 * @see https://jasmine.github.io/api/edge/global.html#JasmineDoneInfo
 */
export interface JasmineDoneInfo {

    /** The overall result of the suite: 'passed', 'failed', or 'incomplete'. */
    overallStatus: string;

    /** Explanation of why the suite was incomplete. */
    incompleteReason: string | undefined;

    /** Information about the ordering (random or not) of this execution of the suite. */
    order: Order;

    /** List of expectations that failed in an afterAll at the global level. */
    failedExpectations:	Expectation[];

    /** List of deprecation warnings that occurred at the global level. */
    deprecationWarnings: Expectation[];
}
