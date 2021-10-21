/**
 * @see https://devblogs.microsoft.com/typescript/announcing-typescript-4-1/#key-remapping-in-mapped-types
 *
 * @package
 */
export type SubtractKeys<Minuend, Subtrahend> = {
    [Key in keyof Minuend as Exclude<Key, keyof Subtrahend>]: Minuend[Key];
}
