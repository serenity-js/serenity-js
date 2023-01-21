/**
 * Returns true if `value` is a [JavaScript primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive),
 * false otherwise.
 *
 * @param value
 */
export function isPrimitive(value: unknown): boolean {
    if (value === null) {
        return true;
    }

    return [
        'string',
        'number',
        'bigint',
        'boolean',
        'undefined',
        'symbol'
    ].includes(typeof value);
}
