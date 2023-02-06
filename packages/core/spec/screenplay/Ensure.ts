import { equal } from 'tiny-types/lib/objects/equal';

import { AssertionError } from '../../src/errors';
import { d } from '../../src/io';
import { Answerable, Interaction } from '../../src/screenplay';

export const Ensure = {
    same: <T>(actual: Answerable<T>, expected: T): Interaction =>
        Interaction.where(`#actor ensures that both values are the same`, async actor => {
            const actualValue   = await actor.answer(actual);
            const expectedValue = await actor.answer(expected);

            if (actualValue !== expectedValue) {
                throw new AssertionError(`Expected ${ actualValue } to be the same as ${ expectedValue }`);
            }
        }),

    equal: <T>(actual: Answerable<T>, expected: Answerable<T>): Interaction =>
        Interaction.where(`#actor ensures that both values are the same`, async actor => {
            const actualValue   = await actor.answer(actual);
            const expectedValue = await actor.answer(expected);

            if (! equal(actualValue, expectedValue)) {
                throw new AssertionError(`Expected ${ actualValue } to equal ${ expectedValue }`);
            }
        }),

    greaterThanOrEqual: <T extends number>(actual: Answerable<T>, expected: Answerable<T>): Interaction =>
        Interaction.where(d`#actor ensures that ${actual} >= ${ expected }`, async actor => {
            const actualValue   = await actor.answer(actual);
            const expectedValue = await actor.answer(expected);

            if (! (actualValue >= expectedValue)) {
                throw new AssertionError(`Expected ${ actualValue } to be greater than or equal to ${ expectedValue }`);
            }
        }),

    lessThan: <T extends number>(actual: Answerable<T>, expected: Answerable<T>): Interaction =>
        Interaction.where(d`#actor ensures that ${actual} < ${ expected }`, async actor => {
            const actualValue   = await actor.answer(actual);
            const expectedValue = await actor.answer(expected);

            if (! (actualValue < expectedValue)) {
                throw new AssertionError(`Expected ${ actualValue } to be less than ${ expectedValue }`);
            }
        }),

    closeTo: <T extends number>(actual: Answerable<T>, expected: Answerable<T>, tolerance: Answerable<T>): Interaction =>
        Interaction.where(d`#actor ensures that ${actual} is close to ${ expected } ±${ tolerance }`, async actor => {
            const actualValue       = await actor.answer(actual);
            const expectedValue     = await actor.answer(expected);
            const toleranceValue    = await actor.answer(tolerance);

            if (! (Math.abs(actualValue - expectedValue) <= toleranceValue)) {
                throw new AssertionError(`Expected ${ actualValue } to be close to ${ expectedValue } ±${ toleranceValue }`);
            }
        }),
}
