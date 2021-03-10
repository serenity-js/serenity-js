import { Answerable, Expectation } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects'; // tslint:disable-line:no-submodule-imports

export function contain<Item>(expected: Answerable<Item>): Expectation<Item, Item[]> {
    return Expectation.thatActualShould<Item, Item[]>('contain', expected)
        .soThat((actualValue, expectedValue) => !! ~ actualValue.findIndex(av => equal(av, expectedValue)));
}
