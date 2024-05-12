/**
 * Checks if the value has a good chance of being a plain JavaScript object
 *
 * @param v
 */
export function isPlainObject(v: unknown): v is object {   // eslint-disable-line @typescript-eslint/ban-types

    // Basic check for Type object that's not null
    if (typeof v === 'object' && v !== null) {

        // If Object.getPrototypeOf supported, use it
        if (typeof Object.getPrototypeOf === 'function') {
            const proto = Object.getPrototypeOf(v);
            return proto === Object.prototype || proto === null;
        }

        // Otherwise, use internal class
        // This should be reliable as if getPrototypeOf not supported, is pre-ES5
        return Object.prototype.toString.call(v) === '[object Object]';
    }

    // Not an object
    return false;
}
