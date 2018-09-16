import { RuntimeError } from './RuntimeError';

/**
 * @desc Thrown when a {@link Interaction}, {@link Task} or test scenario can't be executed due to a logical error.
 * For example, it's not possible to assert on the last HTTP Response if the request hasn't been performed yet.
 */
export class LogicError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(LogicError, message, cause);
    }
}
