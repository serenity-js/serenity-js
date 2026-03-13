import { RuntimeError } from '@serenity-js/core/lib/errors/index.js';

/**
 * @private
 */
export class UnableToReadFeatureFileError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(UnableToReadFeatureFileError, message, cause);
    }
}
