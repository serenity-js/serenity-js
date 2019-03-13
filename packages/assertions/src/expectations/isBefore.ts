import { KnowableUnknown } from '@serenity-js/core';

import { Expectation } from '../Expectation';

export function isBefore(expected: KnowableUnknown<Date>): Expectation<Date> {
    return Expectation.thatActualShould<Date, Date>('have value that is before', expected)
        .soThat((actualValue, expectedValue) => actualValue.getTime() < expectedValue.getTime());
}
