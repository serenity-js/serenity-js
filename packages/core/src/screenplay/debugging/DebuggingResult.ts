/**
 * An interface describing debugging data received by the callback function passed to [`Debug.values`](https://serenity-js.org/api/core/class/Debug/#values).
 *
 * @group Activities
 */
export interface DebuggingResult<T> {
    description: string;
    value: T | undefined;
    error: Error | undefined;
}
