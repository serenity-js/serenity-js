import { RuntimeError } from './RuntimeError';

/**
 * @desc
 *  Thrown to indicate that an unknown error has occurred.
 *
 * @extends {RuntimeError}
 */
export class UnknownError extends RuntimeError {

    /**
     * @param {string} message - Human-readable description of the error
     * @param {Error} [cause] - The root cause of this {@link RuntimeError}, if any
     */
    constructor(message: string, cause?: Error) {
        super(UnknownError, message, cause);
    }
}
