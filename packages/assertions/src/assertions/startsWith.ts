import { KnowableUnknown } from '@serenity-js/core';
import { Assertion } from '../Assertion';

export function startsWith(expected: KnowableUnknown<string>): Assertion<string> {
    return new StartsWith(expected);
}

class StartsWith extends Assertion<string> {
    test(expected: string, actual: string): boolean {
        return !! actual && actual.startsWith(expected);
    }

    describeIs(descriptionOfActual: string): string {
        return `starts with ${ descriptionOfActual }`;
    }

    describeShould(descriptionOfActual: string): string {
        return `start with ${ descriptionOfActual }`;
    }
}
