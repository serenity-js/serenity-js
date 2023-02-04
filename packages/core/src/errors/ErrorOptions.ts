import { FileSystemLocation } from '../io';
import { ExpectationDetails } from '../screenplay';

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
