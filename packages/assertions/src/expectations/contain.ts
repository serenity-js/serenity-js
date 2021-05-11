import { Answerable, Expectation } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects';

export function contain<Item>(expected: Answerable<Item>): Expectation<Item, Item[]> {
    return Expectation.thatActualShould<Item, Item[]>('contain', expected)
        .soThat((actualValue, expectedValue) => !! ~ actualValue.findIndex(av => equal(av, expectedValue)));
}
