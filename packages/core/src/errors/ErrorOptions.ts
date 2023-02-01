export interface ErrorOptions {
    message: string;
    expectation?: string;
    diff?: {
        expected: unknown;
        actual: unknown;
    };
    cause?: Error;
}
