import { RuntimeError } from '@serenity-js/core/errors';

/**
 * @private
 */
export class ItemNotFoundError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(ItemNotFoundError, message, cause);
    }
}
