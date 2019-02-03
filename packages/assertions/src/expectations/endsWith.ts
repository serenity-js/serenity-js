import { KnowableUnknown } from '@serenity-js/core';

import { Expectation } from '../Expectation';

export function endsWith(expected: KnowableUnknown<string>): Expectation<string> {
    return Expectation.thatActualShould<string, string>('end with', expected)
        .soThat((actualValue, expectedValue) => actualValue.endsWith(expectedValue));
}
