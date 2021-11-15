import { RuntimeError } from '@serenity-js/core';

export class CookieMissingError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(CookieMissingError, message, cause);
    }
}
