import { Answerable, Expectation } from '@serenity-js/core';

export function isLessThan(expected: Answerable<number>): Expectation<number> {
    return Expectation.thatActualShould<number, number>(`have value that's less than`, expected)
        .soThat((actualValue, expectedValue) => actualValue < expectedValue);
}
