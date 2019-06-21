import { RuntimeError } from './RuntimeError';

/**
 * @desc
 *  Thrown to indicate that an assertion has failed.
 *
 * @extends {RuntimeError}
 */
export class AssertionError extends RuntimeError {

    /**
     * @param {string} message - Human-readable description of the error
     * @param {any} expected - The value that was expected
     * @param {any} actual - The value that was received instead of the expected one
     * @param {Error} [cause] - The root cause of this {@link RuntimeError}, if any
     */
    constructor(message: string, public readonly expected: any, public readonly actual: any, cause?: Error) {
        super(AssertionError, message, cause);
    }
}
