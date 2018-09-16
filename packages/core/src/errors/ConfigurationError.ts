import { RuntimeError } from './RuntimeError';

/**
 * @desc Thrown when a test framework or test suite configuration error occurs.
 */
export class ConfigurationError extends RuntimeError {
    constructor(message: string, cause?: Error) {
        super(ConfigurationError, message, cause);
    }
}
