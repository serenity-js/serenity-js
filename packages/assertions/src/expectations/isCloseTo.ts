import { Answerable, AnswersQuestions, d, Expectation, ExpectationMet, ExpectationNotMet } from '@serenity-js/core';

/**
 * Produces an {@apilink Expectation|expectation} that is met when the actual value
 * is within a given ± `absoluteTolerance` range of the `expected` value.
 *
 * ## Ensuring that a given floating point number is close to the expected number
 *
 * ```ts
 *  import { actorCalled } from '@serenity-js/core'
 *  import { Ensure, isCloseTo } from '@serenity-js/assertions'
 *
 *  await actorCalled('Iris').attemptsTo(
 *      Ensure.that(10.123, isCloseTo(10, 0.2))
 *  )
 * ```
 *
 * @param expected
 * @param [absoluteTolerance=1e-9]
 *  Absolute ± tolerance range, defaults to `1e-9`
 *
 * @group Expectations
 */
export function isCloseTo(expected: Answerable<number>, absoluteTolerance: Answerable<number> = 1e-9): Expectation<number> {
    return new IsCloseTo(expected, absoluteTolerance);
}

/**
 * @package
 */
class IsCloseTo extends Expectation<number> {

    constructor(
        private readonly expected: Answerable<number>,
        private readonly absoluteTolerance: Answerable<number>,
    ) {
        super(
            d`have value close to ${ expected } ±${ absoluteTolerance }`,
            async (actor: AnswersQuestions, actual: Answerable<number>) => {

                const actualValue: number   = await actor.answer(actual);
                const expectedValue: number = await actor.answer(this.expected);
                const tolerance: number     = await actor.answer(this.absoluteTolerance);

                const description = `have value close to ${ expectedValue } ±${ tolerance }`

                // short-circuit exact equality
                if (actualValue === expectedValue) {
                    return new ExpectationMet(description, expectedValue, actualValue);
                }

                if (! (Number.isFinite(actualValue) && Number.isFinite(expectedValue))) {
                    return new ExpectationNotMet(description, expectedValue, actualValue);
                }

                const difference = Math.abs(actualValue - expectedValue)

                const isClose = difference <= tolerance;

                return isClose
                    ? new ExpectationMet(description, expectedValue, actualValue)
                    : new ExpectationNotMet(description, expectedValue, actualValue);
            }
        );
    }
}
