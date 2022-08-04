import { Answerable } from '../Answerable';

/**
 * Describes an {@link Actor} who can answer a {@link Question} about the system under test.
 *
 * ## Learn more
 *
 * - {@link Question}
 * - {@link Actor}
 *
 * @group Actors
 */
export interface AnswersQuestions {

    /**
     * Makes the {@link Actor} evaluate an {@link Answerable}
     * and return the value it holds.
     */
    answer<T>(answerable: Answerable<T>): Promise<T>;
}
