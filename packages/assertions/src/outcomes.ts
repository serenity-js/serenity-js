import { TinyType } from 'tiny-types';

export class Outcome<Expected, Actual> extends TinyType {
    constructor(
        public readonly message: string,
        public readonly expected: Expected,
        public readonly actual: Actual,
    ) {
        super();
    }
}

export class ExpectationMet<Expected, Actual> extends Outcome<Expected, Actual> {}

export class ExpectationNotMet<Expected, Actual> extends Outcome<Expected, Actual> {}
