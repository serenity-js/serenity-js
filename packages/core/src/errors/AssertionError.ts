import { JSONObject } from 'tiny-types';

import { ErrorSerialiser } from './ErrorSerialiser';
import { RuntimeError } from './RuntimeError';

/**
 * Thrown to indicate that an assertion has failed.
 *
 * @group Errors
 */
export class AssertionError extends RuntimeError {

    static fromJSON(serialised: JSONObject): AssertionError {
        const error = new AssertionError(
            serialised.message as string,
            serialised.expected as unknown,
            serialised.actual as unknown,
            ErrorSerialiser.deserialise(serialised.cause as string | undefined),
        );

        error.stack = serialised.stack as string;

        return error;
    }

    /**
     * @param message - Human-readable description of the error
     * @param expected - The value that was expected
     * @param actual - The value that was received instead of the expected one
     * @param [cause] - The root cause of this {@apilink RuntimeError}, if any
     */
    constructor(message: string, public readonly expected: unknown, public readonly actual: unknown, cause?: Error) {
        super(AssertionError, message, cause);
    }
}
