/**
 * @package
 * @see https://jasmine.github.io/api/edge/global.html#Expectation
 */
export interface Expectation {

    /** The name of the matcher that was executed for this expectation. */
    matcherName: string;

    /** The failure message for the expectation. */
    message: string;

    /** The stack trace for the failure if available. */
    stack?: string;

    /** Whether the expectation passed or failed. */
    passed:	boolean;

    /** If the expectation failed, what was the expected value. */
    expected?: any;

    /** If the expectation failed, what actual value was produced. */
    actual?: any;
}
