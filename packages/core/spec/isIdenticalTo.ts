import { Expectation } from '../src';

export function isIdenticalTo<T>(expected: T): Expectation<T, T> {
    return Expectation.thatActualShould<T, T>('have value identical to', expected)
        .soThat((actualValue: T, expectedValue: T) => actualValue === expectedValue);
}
