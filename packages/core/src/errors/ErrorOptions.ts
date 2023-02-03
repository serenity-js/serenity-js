import { FileSystemLocation } from '../io';

export interface ErrorOptions {
    message: string;
    location?: FileSystemLocation;
    expectation?: string;
    diff?: {
        expected: unknown;
        actual: unknown;
    };
    cause?: Error;
}
