import { Assertion } from './Assertion';

export function not<V>(assertion: Assertion<V>) {
    return new Not(assertion);
}

class Not<T> extends Assertion<T> {
    constructor(private readonly negated: Assertion<T>) {
        super(negated.expected);
    }

    test(expected: T, actual: T): boolean {
        return ! this.negated.test(expected, actual);
    }

    describeIs(descriptionOfActual: string): string {
        return `not ${ this.negated.describeIs(descriptionOfActual) }`;
    }

    describeShould(descriptionOfActual: string): string {
        return `not ${ this.negated.describeShould(descriptionOfActual) }`;
    }
}
