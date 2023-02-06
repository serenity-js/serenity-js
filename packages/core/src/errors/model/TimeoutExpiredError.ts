import { JSONObject } from 'tiny-types';

import { ErrorSerialiser } from '../ErrorSerialiser';
import { RuntimeError } from './RuntimeError';

/**
 * Thrown to indicate that an {@apilink Interaction}, a {@apilink Task} or a test scenario
 * took longer to execute than the expected timeout.
 *
 * @group Errors
 */
export class TimeoutExpiredError extends RuntimeError {

    static fromJSON(serialised: JSONObject): TimeoutExpiredError {
        const error = new TimeoutExpiredError(
            serialised.message as string,
            ErrorSerialiser.deserialise(serialised.cause as string | undefined),
        );

        error.stack = serialised.stack as string;

        return error;
    }

    /**
     * @param message
     *  Human-readable description of the error
     *
     * @param [cause]
     *  The root cause of this {@apilink RuntimeError}, if any
     */
    constructor(
        message: string,
        cause?: Error
    ) {
        super(TimeoutExpiredError, message, cause);
    }
}
