import { KnownUnknown } from '@serenity-js/core';
import { equal } from 'tiny-types/lib/objects/equal';   // tslint:disable-line:no-submodule-imports
import { Assertion } from './Assertion';

export function equals<T>(expected: KnownUnknown<T>): Assertion<T> {
    return new Equals(expected);
}

class Equals<T> extends Assertion<T> {
    test(expected: T, actual: T): boolean {
        return equal(expected, actual);
    }

    describeIs(descriptionOfActual: string): string {
        return `equal to ${ descriptionOfActual }`;
    }

    describeShould(descriptionOfActual: string): string {
        return `be equal to ${ descriptionOfActual }`;
    }
}
