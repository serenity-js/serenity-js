import { AssertionError } from '../../src/errors';
import { Answerable, Interaction } from '../../src/screenplay';

export const EnsureSame = <T>(answerable: Answerable<T>, expected: T): Interaction =>
    Interaction.where(`#actor ensures that both values are the same`, async actor => {
        const actual = await actor.answer(answerable);
        if (actual !== expected) {
            throw new AssertionError(`Expected ${ actual } to be the same as ${ expected }`, expected, actual);
        }
    });
