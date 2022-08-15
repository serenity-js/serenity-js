import { ExpectationOutcome } from './ExpectationOutcome';

/**
 * Indicates that an {@apilink Expectations} was met.
 *
 * @group Expectations
 */
export class ExpectationMet<Expected, Actual> extends ExpectationOutcome<Expected, Actual> {}
