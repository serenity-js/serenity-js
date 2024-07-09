import { LogicError } from '@serenity-js/core';

/**
 * Thrown when you're trying to take a screenshot of a browser window
 * that's already been closed.
 *
 * ## Learn more
 * - [`TakeScreenshot`](https://serenity-js.org/api/web/class/TakeScreenshot/)
 * - [`Page.takeScreenshot`](https://serenity-js.org/api/web/class/Page/#takeScreenshot)
 *
 * @group Errors
 */
export class BrowserWindowClosedError extends LogicError {
    constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}
