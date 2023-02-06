import { JSONValue, TinyType } from 'tiny-types';
import * as util from 'util';   // eslint-disable-line unicorn/import-style

/**
 * A placeholder value signifying that a {@apilink Question}
 * has not been answered by an {@apilink Actor} when producing an {@apilink ExpectationOutcome}.
 * This happens when Serenity/JS decides that answering a given question
 * won't affect the outcome.
 *
 * For example, making the actor answer questions about the expected value
 * and the actual value of each list item is unnecessary if we already know that the list itself is empty.
 *
 * @group Questions
 */
export class Unanswered extends TinyType {
    [util.inspect.custom](): string {
        return `<<unanswered>>`;
    }

    toString(): string {
        return 'unanswered';
    }

    toJSON(): JSONValue {
        return undefined;   // eslint-disable-line unicorn/no-useless-undefined
    }
}
