import { RuntimeError } from '@serenity-js/core';

export class NoAnswerFound extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(NoAnswerFound, message, cause);
    }
}
