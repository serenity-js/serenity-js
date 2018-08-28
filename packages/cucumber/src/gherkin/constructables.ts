export interface Constructor<T> {
    new (...args: any[]): T;
}

export interface Constructable<T> {
    constructor: Function;  // tslint:disable-line:ban-types
}
