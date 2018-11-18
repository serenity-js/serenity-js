import { KnowableUnknown } from '@serenity-js/core';
import { Assertion } from '../Assertion';

export function containsText(expected: KnowableUnknown<string>): Assertion<string> {
    return new ContainText(expected);
}

class ContainText extends Assertion<string> {
    test(expected: string, actual: string): boolean {
        return !! expected
            && !! actual
            && actual.includes(expected);
    }

    toString(): string {
        return 'contain';
    }
}
