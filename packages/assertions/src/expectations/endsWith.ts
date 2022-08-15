import { Answerable, Expectation } from '@serenity-js/core';

/**
 * Creates an {@apilink Expectation|expectation} that is met when the actual `string` value
 * ends with the resolved value of `expected`.
 *
 * ## Ensuring that a given string ends with an expected substring
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, endsWith } from '@serenity-js/assertions'
 *
 * await actorCalled('Ester').attemptsTo(
 *   Ensure.that('Hello World!', endsWith('!')),
 * )
 * ```
 *
 * @param expected
 *
 * @group Expectations
 */
export function endsWith(expected: Answerable<string>): Expectation<string> {
    return Expectation.thatActualShould<string, string>('end with', expected)
        .soThat((actualValue, expectedValue) => actualValue.endsWith(expectedValue));
}
