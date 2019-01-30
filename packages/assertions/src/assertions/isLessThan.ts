import { KnowableUnknown } from '@serenity-js/core';

import { Assertion } from './Assertion';

export function isLessThan(expected: KnowableUnknown<number>): Assertion<number> {
    return Assertion.thatActualShould<number, number>(`have value that's less than`, expected)
        .soThat((actualValue, expectedValue) => actualValue < expectedValue);
}
