import { Question } from '@serenity-js/core';
import { Assertion } from '../src';

export function p<T>(value: T) {
    return Promise.resolve(value);
}

export function q<T>(value: T): Question<T> {
    return Question.about(`something`, actor => value);
}

export function isIdenticalTo<T>(expected: T) {
    return Assertion.thatActualShould<T, T>('have value identical to', expected)
        .soThat((actualValue: T, expectedValue: T) => actualValue === expectedValue);
}
