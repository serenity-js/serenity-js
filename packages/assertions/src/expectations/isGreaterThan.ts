import { KnowableUnknown } from '@serenity-js/core';

import { Expectation } from '../Expectation';

export function isGreaterThan(expected: KnowableUnknown<number>): Expectation<number> {
    return Expectation.thatActualShould<number, number>('have value greater than', expected)
        .soThat((actualValue, expectedValue) => actualValue > expectedValue);
}
