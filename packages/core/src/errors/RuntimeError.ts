/**
 * @desc
 *  Base class for custom errors that may occur during execution of a test scenario.
 *
 * @example <caption>Custom Error definition</caption>
 * import { RuntimeError } from '@serenity-js/core';
 *
 * export class CustomError extends RuntimeError {
 *   constructor(message: string, cause?: Error) {
 *       super(CustomError, message, cause);
 *   }
 * }
 *
 * @example <caption>Sync error handling</caption>
 * try {
 *     operationThatMightThrowAnError();
 * } catch(error) {
 *     // catch and re-throw
 *     throw new CustomError('operationThatMightThrowAnError has failed', error);
 * }
 *
 * @example <caption>Async error handling</caption>
 * operationThatMightRejectAPromise().catch(error => {
 *     // catch and re-throw
 *     throw new CustomError('operationThatMightThrowAnError has failed', error);
 * });
 *
 * @extends {Error}
 */
export abstract class RuntimeError extends Error {

    /**
     * @param {Function} type - Constructor function used to instantiate a subclass of a RuntimeError
     * @param {string} message - Human-readable description of the error
     * @param {Error} [cause] - The root cause of this {@link RuntimeError}, if any
     */
    protected constructor(
        type: new (...args: any[]) => RuntimeError,
        message: string,
        public readonly cause?: Error,
    ) {
        super(message);
        Object.setPrototypeOf(this, type.prototype);
        this.name = this.constructor.name;

        Error.captureStackTrace(this, type);

        if (cause) {
            this.stack = `${ this.stack }\nCaused by: ${ cause.stack }`;
        }
    }

    /**
     * @desc
     *  Human-readable description
     */
    toString(): string {
        return `${ this.constructor.name }: ${ this.message }`;
    }
}
