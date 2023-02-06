import { JSONObject } from 'tiny-types';

import { ErrorSerialiser } from '../ErrorSerialiser';
import { RuntimeError } from './RuntimeError';

/**
 * Thrown to indicate that the {@apilink Actor} attempted to perform
 * a {@apilink Task} or {@apilink Interaction} that hasn't been implemented yet.
 *
 * ## A pending Task
 *
 * ```ts
 * import { Task } from '@serenity-js/core'
 *
 * // A pending Task is one that encapsulates no other activities
 * const Authenticate = () =>
 *   Task.where(`#actor authenticates with the service up a test database` )
 * ```
 *
 * ## A pending Interaction
 *
 * ```ts
 * import { Interaction } from '@serenity-js/core'
 *
 * // A pending Interaction is one that doesn't perform any action
 * const DoubleClick = () =>
 *   Interaction.where(`#actor double-clicks`)
 * ```
 *
 * @group Errors
 */
export class ImplementationPendingError extends RuntimeError {

    static fromJSON(serialised: JSONObject): ImplementationPendingError {
        const error = new ImplementationPendingError(
            serialised.message as string,
            ErrorSerialiser.deserialise(serialised.cause as string | undefined),
        );

        error.stack = serialised.stack as string;

        return error;
    }

    /**
     * @param {string} message - Human-readable description of the error
     * @param {Error} [cause] - The root cause of this {@apilink RuntimeError}, if any
     */
    constructor(message: string, cause?: Error) {
        super(ImplementationPendingError, message, cause);
    }
}
