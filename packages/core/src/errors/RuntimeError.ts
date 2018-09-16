/**
 * @desc Base class for custom errors that may occur during execution of a test scenario.
 *
 * @example <caption>Custom Error definition</caption>
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
 */
export abstract class RuntimeError extends Error {

    protected constructor(type: { new(...args: any[]): RuntimeError } , message: string, cause?: Error) {
        super(message);
        Object.setPrototypeOf(this, type.prototype);
        Error.captureStackTrace(this, type);

        if (!! cause) {
            this.stack = `${ this.stack }\nCaused by: ${ cause.stack }`;
        }
    }

    toString() {
        return `${ this.constructor.name }: ${ this.message }`;
    }
}
