import { KnowableUnknown } from '@serenity-js/core';

import { Assertion } from './Assertion';

export function endsWith(expected: KnowableUnknown<string>): Assertion<string> {
    return Assertion.thatActualShould<string, string>('end with', expected)
        .soThat((actualValue, expectedValue) => actualValue.endsWith(expectedValue));
}
