import { TinyType } from 'tiny-types';

/**
 * A placeholder value signifying that a {@apilink Question}
 * has not been answered by an {@apilink Actor} when producing an {@apilink ExpectationOutcome}.
 * This happens when Serenity/JS decides that answering a given question
 * won't affect the outcome.
 *
 * For example, making the actor answer questions about the expected value
 * and the actual value of each list item is unnecessary if we already know that the list itself is empty.
 */
export class Unanswered extends TinyType {
    toString(): string {
        return 'unanswered';
    }
}
