/**
 * @desc
 *  Describes a collection providing
 *  a [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)-like interface.
 *
 * @interface
 *
 * @see {@link ElementArrayFinder}
 * @see {@link Loop}
 */
export interface Reducible {
    /**
     * @type {function<T,A>(callback: (accumulator: A, currentValue: T, index: number) => A, initialValue: A): PromiseLike<A> | A}
     */
    reduce: <T, A>(fn: (accumulator: A, currentValue: T, index: number) => A, initialValue: A) => PromiseLike<A> | A;
}
