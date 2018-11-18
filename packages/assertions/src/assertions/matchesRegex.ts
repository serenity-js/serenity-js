import { KnowableUnknown } from '@serenity-js/core';
import { Assertion } from '../Assertion';

export function matchesRegex(expected: KnowableUnknown<RegExp>): Assertion<RegExp, string> {
    return new MatchRegex(expected);
}

class MatchRegex extends Assertion<RegExp, string> {
    test(expected: RegExp, actual: string): boolean {
        return !! expected
            && !! actual
            && expected.test(actual);
    }

    toString(): string {
        return 'match';
    }
}
