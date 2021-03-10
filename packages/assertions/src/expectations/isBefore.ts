import { Answerable, Expectation } from '@serenity-js/core';

export function isBefore(expected: Answerable<Date>): Expectation<Date> {
    return Expectation.thatActualShould<Date, Date>('have value that is before', expected)
        .soThat((actualValue, expectedValue) => actualValue.getTime() < expectedValue.getTime());
}
