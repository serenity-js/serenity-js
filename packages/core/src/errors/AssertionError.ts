import { RuntimeError } from './RuntimeError';

export class AssertionError extends RuntimeError {
    constructor(message: string, public readonly expected: any, public readonly actual: any, cause?: Error) {
        super(AssertionError, message, cause);
    }
}
