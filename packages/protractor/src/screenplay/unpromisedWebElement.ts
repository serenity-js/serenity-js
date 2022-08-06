import { WebElement } from 'protractor';

/**
 * Under [certain conditions](https://github.com/angular/protractor/blob/4bc80d1a459542d883ea9200e4e1f48d265d0fda/lib/element.ts#L797),
 * Protractor `WebElement` implements a `then()` method, and under others it doesn't.
 *
 * This design makes it look like a "thenable" in some scenarios, but like a non-thenable in others.
 *
 * This function wraps `WebElement` in a `Proxy` object that ensures the wrapped element is always non-thenable.
 *
 * @param promiseLike
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
