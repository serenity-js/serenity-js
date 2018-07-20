import { RuntimeError } from './RuntimeError';

export class AsyncOperationError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(AsyncOperationError, message, cause);
    }
}
