import { KnowableUnknown } from '@serenity-js/core';
import { Assertion } from '../Assertion';

export function endsWith(expected: KnowableUnknown<string>): Assertion<string> {
    return new EndWith(expected);
}

class EndWith extends Assertion<string> {
    test(expected: string, actual: string): boolean {
        return !! expected
            && !! actual
            && actual.endsWith(expected);
    }
}
