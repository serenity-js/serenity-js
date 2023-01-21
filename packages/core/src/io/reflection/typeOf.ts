/**
 * Describes the type of the provided value.
 *
 * @param value
 */
export function typeOf(value: unknown): string {
    switch (true) {
        case value === null:
            return 'null';
        case typeof value !== 'object':
            return typeof value;
        case value instanceof Date:
            return `Date`;
        case Array.isArray(value):
            return `Array`;
        case value instanceof RegExp:
            return `RegExp`
        case value instanceof Set:
            return 'Set';
        case value instanceof Map:
            return 'Map';
        case !! value.constructor && value.constructor !== Object:
            return value.constructor.name
        default:
            return 'object';
    }
}
