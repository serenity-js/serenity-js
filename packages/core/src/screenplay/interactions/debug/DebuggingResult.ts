export interface DebuggingResult<T> {
    description: string;
    value: T | undefined;
    error: Error | undefined;
}
