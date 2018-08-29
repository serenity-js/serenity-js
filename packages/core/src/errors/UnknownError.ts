import { RuntimeError } from './RuntimeError';

export class UnknownError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(UnknownError, message, cause);
    }
}
