import { LogicError } from '@serenity-js/core';

export class ModalDialogObstructsScreenshotError extends LogicError {
    constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}
