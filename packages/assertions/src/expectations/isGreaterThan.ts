import { Answerable } from '@serenity-js/core';

import { Expectation } from '../Expectation';

export function isGreaterThan(expected: Answerable<number>): Expectation<number> {
    return Expectation.thatActualShould<number, number>('have value greater than', expected)
        .soThat((actualValue, expectedValue) => actualValue > expectedValue);
}
