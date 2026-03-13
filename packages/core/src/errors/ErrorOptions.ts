import type { FileSystemLocation } from '../io/index.js';
import type { ExpectationDetails } from '../screenplay/index.js';

/**
 * @group Errors
 */
export interface ErrorOptions {
    message: string;
    location?: FileSystemLocation;
    expectation?: ExpectationDetails;
    diff?: {
        expected: unknown;
        actual: unknown;
    };
    cause?: Error;
}
