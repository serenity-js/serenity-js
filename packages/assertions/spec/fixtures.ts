import { Actor, d, Expectation, Question, QuestionAdapter } from '@serenity-js/core';

export function p<T>(value: T): Promise<T> {
    return Promise.resolve(value);
}

export function q<T>(value: T): QuestionAdapter<Awaited<T>> {
    return Question.about(`something`, (_: Actor) => value);
}

export const isIdenticalTo = Expectation.define(
    'isIdenticalTo',
    (expected) => d`have value identical to ${ expected }`,
    <T>(actual: T, expected: T) =>
        actual === expected,
)
