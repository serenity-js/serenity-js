import { d, Expectation } from '../src';

export const isIdenticalTo = Expectation.define(
    'isIdenticalTo',
    expected => d`have value identical to ${ expected }`,
    <T>(actual: T, expected: T) =>
        actual === expected,
)
