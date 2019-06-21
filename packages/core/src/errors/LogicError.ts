import { RuntimeError } from './RuntimeError';

/**
 * @desc
 *  Thrown to indicate that an {@link Interaction}, a {@link Task} or a test scenario
 *  can't be executed due to a logical error.
 *  For example, it's not possible to assert on the last HTTP Response if the request
 *  hasn't been performed yet.
 *
 * @extends {RuntimeError}
 */
export class LogicError extends RuntimeError {

    /**
     * @param {string} message - Human-readable description of the error
     * @param {Error} [cause] - The root cause of this {@link RuntimeError}, if any
     */
    constructor(message: string, cause?: Error) {
        super(LogicError, message, cause);
    }
}
