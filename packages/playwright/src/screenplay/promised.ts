/**
 * Playwright 1.33.0 and newer rely on "zones" recorded in the stack trace
 * to establish child-parent relationship between Playwright tasks.
 *
 * This helper function ensures that the stack trace is correctly recorded.
 *
 * @param value
 */
export function promised<T>(value: Promise<T> | T): Promise<T> {
    return Promise.resolve().then(() => value);
}
