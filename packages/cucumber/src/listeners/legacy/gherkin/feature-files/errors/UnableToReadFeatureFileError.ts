import { RuntimeError } from '@serenity-js/core/errors';

/**
 * @private
 */
export class UnableToReadFeatureFileError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(UnableToReadFeatureFileError, message, cause);
    }
}
