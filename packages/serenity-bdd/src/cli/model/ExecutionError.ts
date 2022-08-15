import { RuntimeError } from '@serenity-js/core';

/**
 * @desc
 *  An error that has occurred during the execution of the Serenity BDD jar.
 *
 * @package
 */
export class ExecutionError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(ExecutionError, message, cause);
    }
}
