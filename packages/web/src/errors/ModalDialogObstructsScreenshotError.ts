import { LogicError } from '@serenity-js/core';

/**
 * Thrown when the presence of a JavaScript dialog obstructs taking a screenshot.
 *
 * ## Learn more
 * - [`Photographer`](https://serenity-js.org/api/web/class/Photographer/)
 * - [`LogicError`](https://serenity-js.org/api/core/class/LogicError/)
 * - [`TakeScreenshot`](https://serenity-js.org/api/web/class/TakeScreenshot/)
 *
 * @group Errors
 */
export class ModalDialogObstructsScreenshotError extends LogicError {
    constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}
