import { RuntimeError } from './RuntimeError';

/**
 * @desc
 *  Thrown to indicate that a test framework or test suite configuration error occurs.
 *
 * @extends {RuntimeError}
 */
export class ConfigurationError extends RuntimeError {

    /**
     * @param {string} message - Human-readable description of the error
     * @param {Error} [cause] - The root cause of this {@link RuntimeError}, if any
     */
    constructor(message: string, cause?: Error) {
        super(ConfigurationError, message, cause);
    }
}
