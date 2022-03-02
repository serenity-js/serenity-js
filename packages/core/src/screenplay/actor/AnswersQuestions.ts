import { Answerable } from '../Answerable';

/**
 * @desc
 *  Enables the {@link Actor} to answer a {@link Question} about the system under test
 *
 * @public
 */
export interface AnswersQuestions {

    /**
     * @desc
     *  Makes the {@link Actor} evaluate an {@link Answerable}
     *  and return the value it holds.
     *
     * @type {function<T>>(answerable: Answerable<T>): Promise<T>}
     */
    answer: <T>(answerable: Answerable<T>) => Promise<T>;
}
