import { RuntimeError } from './RuntimeError';

/**
 * @desc
 *  Thrown to indicate that the {@link Actor} attempted to perform
 *  a {@link Task} or {@link Interaction} that hasn't been implemented yet.
 *
 * @example <caption>A pending Task</caption>
 *  import { Task } from '@serenity-js/core';
 *
 *  // A pending Task is one that encapsulates no other activities
 *  const Authenticate = () =>
 *      Task.where(`#actor authenticates with the service up a test database` );
 *
 * @example <caption>A pending Interaction</caption>
 *  import { Interaction } from '@serenity-js/core';
 *
 *  // A pending Interaction is one that doesn't perform any action
 *  const DoubleClick = () =>
 *      Interaction.where(`#actor double-clicks`);
 *
 * @extends {RuntimeError}
 */
export class ImplementationPendingError extends RuntimeError {

    /**
     * @param {string} message - Human-readable description of the error
     * @param {Error} [cause] - The root cause of this {@link RuntimeError}, if any
     */
    constructor(message: string, cause?: Error) {
        super(ImplementationPendingError, message, cause);
    }
}
