import { ExpectationOutcome } from './ExpectationOutcome';

export class ExpectationNotMet<Expected, Actual> extends ExpectationOutcome<Expected, Actual> {}
