import { RuntimeError } from '@serenity-js/core';

/**
 * Thrown when the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
 * you're trying to retrieve has not been set yet.
 *
 * ## Learn more
 * - {@apilink Cookie}
 * - {@apilink RuntimeError}
 *
 * @group Errors
 */
export class CookieMissingError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(CookieMissingError, message, cause);
    }
}
