import type { Answerable } from '../Answerable';

/**
 * Describes an [`Actor`](https://serenity-js.org/api/core/class/Actor/) who can answer a [`Question`](https://serenity-js.org/api/core/class/Question/) about the system under test.
 *
 * ## Learn more
 *
 * - [`Question`](https://serenity-js.org/api/core/class/Question/)
 * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 *
 * @group Actors
 */
export interface AnswersQuestions {

    /**
     * Makes the [`Actor`](https://serenity-js.org/api/core/class/Actor/) evaluate an [`Answerable`](https://serenity-js.org/api/core/#Answerable)
     * and return the value it holds.
     */
    answer<T>(answerable: Answerable<T>): Promise<T>;
}
