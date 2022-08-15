import { TinyType } from 'tiny-types';

/**
 * An outcome of an {@apilink Expectations},
 * which could be either {@apilink ExpectationMet|met} or {@apilink ExpectationNotMet|not met}
 *
 * @group Expectations
 */
export class ExpectationOutcome<Expected, Actual> extends TinyType {
    constructor(
        public readonly message: string,
        public readonly expected: Expected,
        public readonly actual: Actual,
    ) {
        super();
    }
}
