import { LogicError } from '@serenity-js/core';

/**
 * Thrown when you're trying to take a screenshot of a browser window
 * that's already been closed.
 *
 * ## Learn more
 * - {@apilink TakeScreenshot}
 * - {@apilink Page.takeScreenshot}
 *
 * @group Errors
 */
export class BrowserWindowClosedError extends LogicError {
    constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}
