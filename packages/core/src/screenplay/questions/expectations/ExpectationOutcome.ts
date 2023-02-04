import { TinyType } from 'tiny-types';

import { ExpectationDetails } from './ExpectationDetails';

/**
 * An outcome of an {@apilink Expectation},
 * which could be either {@apilink ExpectationMet|met} or {@apilink ExpectationNotMet|not met}.
 *
 * @group Expectations
 */
export class ExpectationOutcome extends TinyType {
    constructor(
        public readonly message: string,
        public readonly expectation: ExpectationDetails,
        public readonly expected: unknown,
        public readonly actual: unknown,
    ) {
        super();
    }
}
