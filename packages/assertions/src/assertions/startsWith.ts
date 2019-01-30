import { KnowableUnknown } from '@serenity-js/core';

import { Assertion } from './Assertion';

export function startsWith(expected: KnowableUnknown<string>): Assertion<string> {
    return Assertion.thatActualShould<string, string>('start with', expected)
        .soThat((actualValue, expectedValue) => actualValue.startsWith(expectedValue));
}
