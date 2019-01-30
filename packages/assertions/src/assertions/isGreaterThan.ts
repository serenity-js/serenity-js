import { KnowableUnknown } from '@serenity-js/core';

import { Assertion } from './Assertion';

export function isGreaterThan(expected: KnowableUnknown<number>): Assertion<number> {
    return Assertion.thatActualShould<number, number>('have value greater than', expected)
        .soThat((actualValue, expectedValue) => actualValue > expectedValue);
}
