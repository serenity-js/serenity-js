/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/ban-types,unicorn/prevent-abbreviations */

/**
 * @package
 * @param obj
 * @param name - name of the method or field to override
 * @param implementation
 */
export function override<T extends object, K extends keyof T>(obj: T, name: K, implementation: T[K]) {
    return new Proxy<T>(obj, {
        get(o: T, property: string | symbol) {
            return property === name
                ? implementation
                : obj[property];
        },
    });
}
