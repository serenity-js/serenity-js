/**
 * An interface describing debugging data received by the callback function passed to {@apilink Debug.values}.
 *
 * @group Activities
 */
export interface DebuggingResult<T> {
    description: string;
    value: T | undefined;
    error: Error | undefined;
}
