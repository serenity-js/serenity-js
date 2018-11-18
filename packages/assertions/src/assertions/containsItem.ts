import { KnowableUnknown } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects/equal';   // tslint:disable-line:no-submodule-imports
import { Assertion } from '../Assertion';

export function containsItem<I>(expected: KnowableUnknown<I>): Assertion<I, I[]> {
    return new ContainsItem<I>(expected);
}

class ContainsItem<I> extends Assertion<I, I[]> {
    test(expected: I, actual: I[]): boolean {
        return !! expected
            && !! actual
            && !! ~ actual.findIndex(item => equal(item, expected));
    }

    toString(): string {
        return 'contain';
    }
}
