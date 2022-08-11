import { ExpectationOutcome } from './ExpectationOutcome';

/**
 * Indicates that an {@apilink Expectations} was not met.
 *
 * @group Expectations
 */
export class ExpectationNotMet<Expected, Actual> extends ExpectationOutcome<Expected, Actual> {}
