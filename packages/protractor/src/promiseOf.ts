/**
 * @desc
 *  Wraps Webdriver promise into a Node-native promise to allow for correct promise chaining.
 *
 * @private
 *
 * @param promiseLike
 * @returns {Promise<T>}
 */
export function promiseOf<T>(promiseLike: PromiseLike<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        promiseLike.then(resolve, reject);
    });
}
