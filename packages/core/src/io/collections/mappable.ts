/**
 * @desc
 *  Describes a collection providing
 *  a [`map`-like interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).
 *
 * @interface
 *
 * @see {@link Question#map}
 * @see {@link ElementArrayFinder}
 */
export interface Mappable<Item> {

    /**
     * @desc
     *  Applies a {@link MappingFunction} function to each element of a {@link Mappable} collection.
     *
     *  The callback receives an item from the collection as the first argument
     *  and its index as the second argument.
     *
     * @abstract
     *
     * @type {function<U>(callback: (item?: Item, index?: number) => U): PromiseLike<U[]> | U[]}
     */
    map: <U>(callback: (item?: Item, index?: number) => U) => PromiseLike<U[]> | U[];
}

/**
 * @desc
 *  A mapping function converting one type into another.
 *
 * @public
 *
 * @typedef {function(item?: V, index?: number) => Promise<O> | O} Mapping<V,O>
 */
export type MappingFunction<V, O> =
    (item?: V, index?: number) => O;

/**
 * @desc
 *  Checks if the value is a {@link Mappable} collection of items.
 *
 * @example <caption>An Array</caption>
 *  import { Mappable } from '@serenity-js/core/lib/io';
 *
 *  Mappable.isMappable([ 1, 2, 3 ]) === true
 *
 * @example <caption>Protractor's ElementArrayFinder</caption>
 *  import { Mappable } from '@serenity-js/core/lib/io';
 *  import { element } from 'protractor';
 *
 *  Mappable.isMappable(element.all(by.tagName('li')) === true
 *
 * @param {Mappable<Item> | any} maybeCollection
 * @returns {boolean}
 */
export function isMappable<Item>(maybeCollection: Mappable<Item> | any): maybeCollection is Mappable<Item> {
    return !! maybeCollection
        && !! maybeCollection.map
        && typeof maybeCollection.map === 'function';
}
