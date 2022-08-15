import { Answerable, Expectation } from '@serenity-js/core';

/**
 * Creates an {@apilink Expectation|expectation} that is met when the actual `string` value
 * matches the `expected` regular expression.
 *
 * ## Ensuring that a given string matches a regular expression
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, includes } from '@serenity-js/assertions'
 *
 * await actorCalled('Ester').attemptsTo(
 *   Ensure.that('Hello World!', matches(/[Ww]orld/)),
 * )
 * ```
 *
 * @param expected
 *
 * @group Expectations
 */
export function matches(expected: Answerable<RegExp>): Expectation<string> {
    return Expectation.thatActualShould<RegExp, string>('match', expected)
        .soThat((actualValue, expectedValue) => expectedValue.test(actualValue));
}
