import { WebElement } from 'protractor';

/**
 * @desc
 *  Wraps Webdriver then-ables into a Node-native promise to allow for correct promise chaining.
 *
 * @private
 *
 * @param promiseLike
 * @returns {Promise<T>}
 */
export function unpromisedWebElement<T extends WebElement>(promiseLike: T): T {

    return new Proxy(promiseLike, {
        has: (target, property) =>
            property !== 'then',
        ownKeys: (target) =>
            Reflect.ownKeys(target)
                .filter(property => property !== 'then'),
        get: (target, property, receiver) =>
            (property in receiver)
                ? target[property]
                : undefined,
    });
}
