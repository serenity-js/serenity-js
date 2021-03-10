import { Answerable, Expectation } from '@serenity-js/core';

export function includes(expected: Answerable<string>): Expectation<string> {
    return Expectation.thatActualShould<string, string>('include', expected)
        .soThat((actualValue, expectedValue) => actualValue.includes(expectedValue));
}
