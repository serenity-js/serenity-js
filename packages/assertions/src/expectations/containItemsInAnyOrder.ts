import { Answerable, Expectation } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects'; // tslint:disable-line:no-submodule-imports

export function containItemsInAnyOrder(expected: Answerable<string[]>): Expectation<string[]> {
    return Expectation.thatActualShould<string[], string[]>('contain all items in any order from', expected)
        .soThat((actualValue, expectedValue) => equal(actualValue.sort(), expectedValue.sort()));
}
