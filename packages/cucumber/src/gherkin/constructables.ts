export type Constructor<T> = new (...args: any[]) => T;

/**
 * @private
 */
export interface Constructable<T> {
    constructor: Function;  // tslint:disable-line:ban-types
}
