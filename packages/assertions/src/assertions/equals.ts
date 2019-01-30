import { KnowableUnknown } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects'; // tslint:disable-line:no-submodule-imports

import { Assertion } from './Assertion';

export function equals<T>(expectedValue: KnowableUnknown<T>): Assertion<T> {
    return Assertion.thatActualShould('equal', expectedValue)
        .soThat((actual, expected) => equal(actual, expected));
}
