import { RuntimeError } from '@serenity-js/core';

/**
 * @desc
 *  An error that has occurred during the execution of the Serenity BDD jar.
 *
 * @extends {@serenity-js/core/lib/core/errors~RuntimeError}
 *
 * @package
 */
export class ExecutionError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(ExecutionError, message, cause);
    }
}
