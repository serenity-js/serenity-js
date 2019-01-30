import { KnowableUnknown } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects'; // tslint:disable-line:no-submodule-imports

import { Assertion } from './Assertion';

export function contains<Item>(expected: KnowableUnknown<Item>): Assertion<Item, Item[]> {
    return Assertion.thatActualShould<Item, Item[]>('contain', expected)
        .soThat((actualValue, expectedValue) => !! ~ actualValue.findIndex(av => equal(av, expectedValue)));
}
