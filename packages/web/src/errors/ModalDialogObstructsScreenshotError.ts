import { LogicError } from '@serenity-js/core';

/**
 * Thrown when the presence of a JavaScript dialog obstructs taking a screenshot.
 *
 * ## Learn more
 * - {@apilink Photographer}
 * - {@apilink LogicError}
 * - {@apilink TakeScreenshot}
 *
 * @group Errors
 */
export class ModalDialogObstructsScreenshotError extends LogicError {
    constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}
