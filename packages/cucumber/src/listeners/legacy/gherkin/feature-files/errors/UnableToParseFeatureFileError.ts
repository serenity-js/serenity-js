import { RuntimeError } from '@serenity-js/core/errors';

/**
 * @private
 */
export class UnableToParseFeatureFileError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(UnableToParseFeatureFileError, message, cause);
    }
}
