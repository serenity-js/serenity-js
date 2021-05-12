import { AssertionError } from '../../src/errors';
import { Interaction, Question } from '../../src/screenplay';

export const EnsureSame = <T>(actual: Question<Promise<T>> | Question<T>, expected: T): Interaction =>
    Interaction.where(`#actor ensures that both values are the same`, actor =>
        actor.answer(actual).then(answer => {
            if (answer !== expected) {
                throw new AssertionError(`Expected ${ answer } to be the same as ${ expected }`, expected, actual);
            }
        }));
