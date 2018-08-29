import { RuntimeError } from '@serenity-js/core/lib/errors';

export class ItemNotFoundError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(ItemNotFoundError, message, cause);
    }
}
