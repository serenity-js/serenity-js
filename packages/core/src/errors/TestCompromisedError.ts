import { RuntimeError } from './RuntimeError';

export class TestCompromisedError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(TestCompromisedError, message, cause);
    }
}
