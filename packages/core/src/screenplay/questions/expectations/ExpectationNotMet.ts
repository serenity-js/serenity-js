import { ExpectationOutcome } from './ExpectationOutcome';

/**
 * Indicates that an {@link Expectations} was not met.
 *
 * @group Expectations
 */
export class ExpectationNotMet<Expected, Actual> extends ExpectationOutcome<Expected, Actual> {}
