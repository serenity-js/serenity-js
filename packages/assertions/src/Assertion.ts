import { KnowableUnknown } from '@serenity-js/core';

export abstract class Assertion<V> {
    constructor(public readonly expected: KnowableUnknown<V>) {
    }

    abstract test(expected: V, actual: V): boolean;

    /**
     * Used in task description
     * @param descriptionOfActual
     */
    abstract describeIs(descriptionOfActual: string): string;

    /**
     * Used in error description
     * @param descriptionOfActual
     */
    abstract describeShould(descriptionOfActual: string): string;
}
