/**
 * Formats text representing expected, received, and unchanged lines of a diff
 * produced by the [`ErrorFactory`](https://serenity-js.org/api/core/class/ErrorFactory/), so that they can be presented to a developer
 * in a visually distinctive way.
 *
 * @group Errors
 */
export interface DiffFormatter {
    expected(line: string): string;
    received(line: string): string;
    unchanged(line: string): string;
}
