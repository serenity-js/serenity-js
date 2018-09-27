import { ValueOf } from '../values';

export abstract class Assertion<V> {
    constructor(public readonly expected: ValueOf<V>) {
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
