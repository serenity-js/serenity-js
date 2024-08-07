import { Expectation, type Timestamp } from '@serenity-js/core';

/**
 * Creates an [expectation](https://serenity-js.org/api/core/class/Expectation/) that is met when the actual value of type `Date`
 * is after the expected `Date`.
 *
 * ## Ensuring that a given date is after the expected date
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Ensure, isAfter } from '@serenity-js/assertions'
 *
 * await actorCalled('Ester').attemptsTo(
 *   Ensure.that(new Date('2022-01-01'), isAfter(new Date('1995-01-01'))),
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
export const isAfter = Expectation.define(
    'isAfter', 'have value that is after',
    (actual: Date | Timestamp, expected: Date | Timestamp) => {
        const actualInMilliseconds = actual instanceof Date
            ? actual.getTime()
            : actual.toMilliseconds();

        const expectedInMilliseconds = expected instanceof Date
            ? expected.getTime()
            : expected.toMilliseconds();

        return actualInMilliseconds > expectedInMilliseconds;
    }
);
