/**
 * @desc
 *  A Serenity/JS-specific customisation - the file system location of the caller of a given `it` and `describe` function.
 *
 * @package
 */
export interface Location {
    path: string;
    column: number;
    line: number;
}
