import { Answerable } from '@serenity-js/core';

import { Expectation } from '../Expectation';

export function isLessThan(expected: Answerable<number>): Expectation<number> {
    return Expectation.thatActualShould<number, number>(`have value that's less than`, expected)
        .soThat((actualValue, expectedValue) => actualValue < expectedValue);
}
