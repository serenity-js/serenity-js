import { Answerable } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects'; // tslint:disable-line:no-submodule-imports

import { Expectation } from '../Expectation';

export function equals<Expected>(expectedValue: Answerable<Expected>): Expectation<Expected> {
    return Expectation.thatActualShould<Expected, Expected>('equal', expectedValue)
        .soThat((actual, expected) => equal(actual, expected));
}
