import { RuntimeError } from '@serenity-js/core/lib/errors';

export class UnableToParseFeatureFileError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(UnableToParseFeatureFileError, message, cause);
    }
}
