import { RuntimeError } from './RuntimeError';

/**
 * @desc
 *  Thrown when {@link Actor} attempts to perform a {@link Task} or {@link Interaction}
 *  that hasn't been implemented yet.
 *
 * @example <caption>A pending Task</caption>
 *  // A pending Task is one that encapsulates no other activities
 *  const Authenticate = () => Task.where(`#actor authenticates with the service up a test database` );
 *
 * @example <caption>A pending Interaction</caption>
 *  // A pending Interaction is one that doesn't perform any action
 *  const DoubleClick = () => Interaction.where(`#actor double-clicks`);
 */
export class ImplementationPendingError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(ImplementationPendingError, message, cause);
    }
}
