import { RuntimeError } from '@serenity-js/core';

export class NoResultsMatching extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(NoResultsMatching, message, cause);
    }
}
