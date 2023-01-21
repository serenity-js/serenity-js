import { ExpectationOutcome } from './ExpectationOutcome';

/**
 * Indicates that an {@apilink Expectation} was not met.
 *
 * @group Expectations
 */
export class ExpectationNotMet<Expected, Actual> extends ExpectationOutcome<Expected, Actual> {}
