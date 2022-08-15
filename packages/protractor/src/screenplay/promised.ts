/**
 * Wraps Webdriver promise-like objects into
 * a Node-native promise to allow for correct promise chaining.
 *
 * @private
 *
 * @param promiseLike
 */
export function promised<T>(promiseLike: PromiseLike<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        promiseLike.then(resolve, reject);
    });
}
