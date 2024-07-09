import { RuntimeError } from '@serenity-js/core';

/**
 * Thrown when the [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
 * you're trying to retrieve has not been set yet.
 *
 * ## Learn more
 * - [`Cookie`](https://serenity-js.org/api/web/class/Cookie/)
 * - [`RuntimeError`](https://serenity-js.org/api/core/class/RuntimeError/)
 *
 * @group Errors
 */
export class CookieMissingError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(CookieMissingError, message, cause);
    }
}
