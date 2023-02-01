import { Expectation } from '@serenity-js/core';

/**
 * Creates an {@apilink Expectation|expectation} that is met when the actual `string` value
 * starts with the resolved value of `expected`.
 *
 * ## Ensuring that a given string starts with an expected substring
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, startsWith } from '@serenity-js/assertions'
 *
 * await actorCalled('Ester').attemptsTo(
 *   Ensure.that('Hello World!', startsWith('Hello')),
 * )
 * ```
 *
 * @param expected
 *
 * @group Expectations
 */
export const startsWith = Expectation.define(
    'startsWith', 'start with',
    (actual: string, expected: string) =>
        actual.startsWith(expected),
)
