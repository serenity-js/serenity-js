import { JSONObject } from 'tiny-types';

import { ErrorSerialiser } from '../io/ErrorSerialiser';
import { Duration } from '../model/Duration';
import { RuntimeError } from './RuntimeError';

/**
 * Thrown to indicate that an {@link Interaction}, a {@link Task} or a test scenario
 * took longer to execute than the expected timeout.
 *
 * @group Errors
 */
export class TimeoutExpiredError extends RuntimeError {

    static fromJSON(serialised: JSONObject): TimeoutExpiredError {
        const error = new TimeoutExpiredError(
            serialised.message as string,
            Duration.fromJSON(serialised.timeout as { milliseconds: number }),
            Duration.fromJSON(serialised.duration as { milliseconds: number }),
            ErrorSerialiser.deserialise(serialised.cause as string | undefined),
        );

        error.stack = serialised.stack as string;

        return error;
    }

    /**
     * @param message
     *  Human-readable description of the error
     *
     * @param timeout
     *  The maximum amount of time an operation was expected to take
     *
     * @param duration
     *  The amount of time the operation took
     *
     * @param [cause]
     *  The root cause of this {@link RuntimeError}, if any
     */
    constructor(
        message: string,
        public readonly timeout: Duration,
        public readonly duration: Duration,
        cause?: Error
    ) {
        super(TimeoutExpiredError, message, cause);
    }
}
