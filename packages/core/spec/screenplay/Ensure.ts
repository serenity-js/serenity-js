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
                throw new AssertionError(`Expected ${ actualValue } to be the same as ${ expectedValue }`, expectedValue, actualValue);
            }
        }),

    equal: <T>(actual: Answerable<T>, expected: Answerable<T>): Interaction =>
        Interaction.where(`#actor ensures that both values are the same`, async actor => {
            const actualValue   = await actor.answer(actual);
            const expectedValue = await actor.answer(expected);

            if (! equal(actualValue, expectedValue)) {
                throw new AssertionError(`Expected ${ actualValue } to equal ${ expectedValue }`, expectedValue, actualValue);
            }
        }),

    greaterThanOrEqual: <T extends number>(actual: Answerable<T>, expected: Answerable<T>): Interaction =>
        Interaction.where(d`#actor ensures that ${actual} >= ${ expected }`, async actor => {
            const actualValue   = await actor.answer(actual);
            const expectedValue = await actor.answer(expected);

            if (! (actualValue >= expectedValue)) {
                throw new AssertionError(`Expected ${ actualValue } to be greater than or equal to ${ expectedValue }`, expectedValue, actualValue);
            }
        }),

    lessThan: <T extends number>(actual: Answerable<T>, expected: Answerable<T>): Interaction =>
        Interaction.where(d`#actor ensures that ${actual} < ${ expected }`, async actor => {
            const actualValue   = await actor.answer(actual);
            const expectedValue = await actor.answer(expected);

            if (! (actualValue < expectedValue)) {
                throw new AssertionError(`Expected ${ actualValue } to be less than ${ expectedValue }`, expectedValue, actualValue);
            }
        }),
}
