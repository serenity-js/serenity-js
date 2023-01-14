/**
 * Describes the type of the provided value.
 *
 * @param value
 */
export function typeOf(value: unknown): string {
    switch (true) {
        case value === undefined:
            return 'undefined';
        case value === null:
            return 'null';
        case typeof value === 'symbol':
            return `symbol: ${ (value as symbol).description }`;
        case typeof value !== 'object': // primitives
            return `${ typeof value }: ${ value }`;
        case value instanceof Date:
            return `date: ${ (value as Date).toISOString() }`;
        case Array.isArray(value):
            return 'array';
        case value instanceof Set:
            return 'set';
        case value instanceof Map:
            return 'map';
        case !! value.constructor && value.constructor !== Object:
            return `instance of ${ value.constructor.name }`
        default:
            return 'object';
    }
}
