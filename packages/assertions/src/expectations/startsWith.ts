import { Answerable } from '@serenity-js/core';

import { Expectation } from '../Expectation';

export function startsWith(expected: Answerable<string>): Expectation<string> {
    return Expectation.thatActualShould<string, string>('start with', expected)
        .soThat((actualValue, expectedValue) => actualValue.startsWith(expectedValue));
}
