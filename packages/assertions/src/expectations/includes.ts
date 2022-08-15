import { Answerable, Expectation } from '@serenity-js/core';

/**
 * Creates an {@apilink Expectation|expectation} that is met when the actual `string` value
 * includes a substring of `expected`.
 *
 * ## Ensuring that a given string includes the expected substring
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, includes } from '@serenity-js/assertions'
 *
 * await actorCalled('Ester').attemptsTo(
 *   Ensure.that('Hello World!', includes('World')),
 * )
 * ```
 *
 * @param expected
 *
 * @group Expectations
 */
export function includes(expected: Answerable<string>): Expectation<string> {
    return Expectation.thatActualShould<string, string>('include', expected)
        .soThat((actualValue, expectedValue) => actualValue.includes(expectedValue));
}
