import { Answerable, Expectation } from '@serenity-js/core';

export function isAfter(expected: Answerable<Date>): Expectation<Date> {
    return Expectation.thatActualShould<Date, Date>('have value that is after', expected)
        .soThat((actualValue, expectedValue) => actualValue.getTime() > expectedValue.getTime());
}
