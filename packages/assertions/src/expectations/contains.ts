import { KnowableUnknown } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects'; // tslint:disable-line:no-submodule-imports

import { Expectation } from '../Expectation';

export function contains<Item>(expected: KnowableUnknown<Item>): Expectation<Item, Item[]> {
    return Expectation.thatActualShould<Item, Item[]>('contain', expected)
        .soThat((actualValue, expectedValue) => !! ~ actualValue.findIndex(av => equal(av, expectedValue)));
}
