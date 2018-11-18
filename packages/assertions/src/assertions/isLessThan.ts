import { KnowableUnknown } from '@serenity-js/core';
import { Assertion } from '../Assertion';

export function isLessThan(expected: KnowableUnknown<number>): Assertion<number> {
    return new HaveValueLessThan(expected);
}

class HaveValueLessThan extends Assertion<number> {
    test(expected: number, actual: number): boolean {
        return !! expected
            && !! actual
            && actual < expected;
    }
}
