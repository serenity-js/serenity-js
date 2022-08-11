import { Answerable, Expectation } from '@serenity-js/core';

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
export function startsWith(expected: Answerable<string>): Expectation<string> {
    return Expectation.thatActualShould<string, string>('start with', expected)
        .soThat((actualValue, expectedValue) => actualValue.startsWith(expectedValue));
}
