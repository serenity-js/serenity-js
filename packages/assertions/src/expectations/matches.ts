import { KnowableUnknown } from '@serenity-js/core';

import { Expectation } from '../Expectation';

export function matches(expected: KnowableUnknown<RegExp>): Expectation<RegExp, string> {
    return Expectation.thatActualShould<RegExp, string>('match', expected)
        .soThat((actualValue, expectedValue) => expectedValue.test(actualValue));
}
