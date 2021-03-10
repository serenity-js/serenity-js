import { TinyType } from 'tiny-types';

export class ExpectationOutcome<Expected, Actual> extends TinyType {
    constructor(
        public readonly message: string,
        public readonly expected: Expected,
        public readonly actual: Actual,
    ) {
        super();
    }
}
