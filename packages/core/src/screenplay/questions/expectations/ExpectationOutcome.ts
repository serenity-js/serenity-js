import { TinyType } from 'tiny-types';

/**
 * An outcome of an {@link Expectations},
 * which could be either {@link ExpectationMet|met} or {@link ExpectationNotMet|not met}
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
