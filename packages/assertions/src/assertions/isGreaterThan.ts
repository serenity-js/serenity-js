import { KnowableUnknown } from '@serenity-js/core';
import { Assertion } from '../Assertion';

export function isGreaterThan(expected: KnowableUnknown<number>): Assertion<number> {
    return new HaveValueGreaterThan(expected);
}

class HaveValueGreaterThan extends Assertion<number> {
    test(expected: number, actual: number): boolean {
        return !! expected
            && !! actual
            && actual > expected;
    }
}
