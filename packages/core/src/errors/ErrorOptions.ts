export interface ErrorOptions {
    message: string;
    diff?: {
        expected: unknown;
        actual: unknown;
    };
    cause?: Error;
}
