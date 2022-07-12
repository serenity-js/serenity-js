import { Answerable, AnswersQuestions, d, Expectation, ExpectationMet, ExpectationNotMet } from '@serenity-js/core';

/**
 * @desc
 *  Expectation that the actual value is within a given ± absolute tolerance range of the expected value.
 *
 * @example
 *  import { actorCalled } from '@serenity-js/core'
 *  import { Ensure, isCloseTo } from '@serenity-js/assertions'
 *
 *  await actorCalled('Iris').attemptsTo(
 *      Ensure.that(10.123, isCloseTo(10, 0.2))
 *  )
 *
 * @param {Answerable<number>} expected
 * @param {Answerable<number>} [absoluteTolerance=1e-9]
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
