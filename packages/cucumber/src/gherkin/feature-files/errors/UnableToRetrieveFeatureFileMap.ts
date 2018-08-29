import { RuntimeError } from '@serenity-js/core/lib/errors';

export class UnableToRetrieveFeatureFileMap extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(UnableToRetrieveFeatureFileMap, message, cause);
    }
}
