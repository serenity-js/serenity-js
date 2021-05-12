import { Answerable, Expectation } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects';

export function equals<Expected>(expectedValue: Answerable<Expected>): Expectation<Expected> {
    return Expectation.thatActualShould<Expected, Expected>('equal', expectedValue)
        .soThat((actual, expected) => equal(actual, expected));
}
