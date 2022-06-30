import { LogicError } from '@serenity-js/core';

export class BrowserWindowClosedError extends LogicError {
    constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}
