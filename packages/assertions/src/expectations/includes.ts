import { Answerable } from '@serenity-js/core';

import { Expectation } from '../Expectation';

export function includes(expected: Answerable<string>): Expectation<string> {
    return Expectation.thatActualShould<string, string>('include', expected)
        .soThat((actualValue, expectedValue) => actualValue.includes(expectedValue));
}
