import { KnowableUnknown } from '@serenity-js/core';

import { Assertion } from './Assertion';

export function includes(expected: KnowableUnknown<string>): Assertion<string> {
    return Assertion.thatActualShould<string, string>('include', expected)
        .soThat((actualValue, expectedValue) => actualValue.includes(expectedValue));
}
