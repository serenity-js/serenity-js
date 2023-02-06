import { Expectation } from '@serenity-js/core';

/**
 * Creates an {@apilink Expectation|expectation} that is met when the actual value of type `Date`
 * is before the expected `Date`.
 *
 * ## Ensuring that a given date is after the expected date
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, isBefore } from '@serenity-js/assertions'
 *
 * await actorCalled('Ester').attemptsTo(
 *   Ensure.that(new Date('1995-01-01'), isBefore(new Date('2022-01-01'))),
 * )
 * ```
 *
 * ## Ensuring that a given date is within the expected date range
 *
 * ```ts
 * import { actorCalled, Expectation, d } from '@serenity-js/core'
 * import { Ensure, and, isAfter, isBefore } from '@serenity-js/assertions'
 *
 * const isWithinDateRange = (lowerBound: Answerable<Date>, upperBound: Answerable<Date>) =>
 *   Expectation.to(d`have value that is between ${ lowerBound } and ${ upperBound }`)
 *     .soThatActual(
 *       and(isAfter(lowerBound), isBefore(upperBound))
 *     ),
 *
 * await actorCalled('Ester').attemptsTo(
 *   Ensure.that(
 *     new Date('2022-01-01'),
 *     isWithinDateRange(new Date('1995-01-01'), new Date('2025-01-01'))
 *   ),
 * )
 * ```
 *
 * @param expected
 *
 * @group Expectations
 */
export const isBefore = Expectation.define(
    'isBefore', 'have value that is before',
    (actual: Date, expected: Date) =>
        actual.getTime() < expected.getTime()
);
