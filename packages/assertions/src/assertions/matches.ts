import { KnowableUnknown } from '@serenity-js/core';

import { Assertion } from './Assertion';

export function matches(expected: KnowableUnknown<RegExp>): Assertion<RegExp, string> {
    return Assertion.thatActualShould<RegExp, string>('match', expected)
        .soThat((actualValue, expectedValue) => expectedValue.test(actualValue));
}
