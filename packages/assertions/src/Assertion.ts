import { KnowableUnknown } from '@serenity-js/core';

export abstract class Assertion<Expected, Actual = Expected> {
    constructor(public readonly expected: KnowableUnknown<Expected>) {
    }

    abstract test(expected: Expected, actual: Actual): boolean;

    toString(): string {
        return this.constructor.name
            .replace(/([A-Z])/g, ' $1')
            .split(' ')
            .map(_ => _.toLowerCase())
            .join(' ')
            .trim();
    }
}
