import { KnowableUnknown } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects/equal';   // tslint:disable-line:no-submodule-imports
import { Assertion } from '../Assertion';

export function equals<T>(expected: KnowableUnknown<T>): Assertion<T> {
    return new Equal(expected);
}

class Equal<T> extends Assertion<T> {
    test(expected: T, actual: T): boolean {
        return equal(expected, actual);
    }
}
