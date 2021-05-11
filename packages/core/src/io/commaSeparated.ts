/**
 * @desc
 *  Produces a comma-separated list based on the list provided.
 *
 * @param {Array<string>} list
 * @param {function(item: string): string} map
 * @param {string} [acc=''] acc
 *
 * @returns {string}
 */
export function commaSeparated(
    list: Array<string | { toString: () => string }>,
    map = item => `${ item }`.trim(),
    acc = '',
): string {
    switch (list.length) {
        case 0:     return acc;
        case 1:     return commaSeparated(tail(list), map, `${ acc }${ map(head(list)) }`);
        case 2:     return commaSeparated(tail(list), map, `${ acc }${ map(head(list)) } and `);
        default:    return commaSeparated(tail(list), map, `${ acc }${ map(head(list)) }, `);
    }
}

/** @package */
function head<T>(list: T[]): T {
    return list[0];
}

/** @package */
function tail<T>(list: T[]): T[] {
    return list.slice(1);
}
