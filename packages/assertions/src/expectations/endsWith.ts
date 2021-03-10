import { Answerable, Expectation } from '@serenity-js/core';

export function endsWith(expected: Answerable<string>): Expectation<string> {
    return Expectation.thatActualShould<string, string>('end with', expected)
        .soThat((actualValue, expectedValue) => actualValue.endsWith(expectedValue));
}
