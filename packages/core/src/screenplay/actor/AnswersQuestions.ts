import { Answerable } from '../Answerable';

/**
 * Describes an {@apilink Actor} who can answer a {@apilink Question} about the system under test.
 *
 * ## Learn more
 *
 * - {@apilink Question}
 * - {@apilink Actor}
 *
 * @group Actors
 */
export interface AnswersQuestions {

    /**
     * Makes the {@apilink Actor} evaluate an {@apilink Answerable}
     * and return the value it holds.
     */
    answer<T>(answerable: Answerable<T>): Promise<T>;
}
