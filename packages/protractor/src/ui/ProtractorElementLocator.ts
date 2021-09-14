import { ByCss, ByCssContainingText, ById, ByLinkText, ByName, ByPartialLinkText, ByTagName, ByXPath, UIElementLocator } from '@serenity-js/web';
import { by } from 'protractor';
import { Locator, WebElement } from 'selenium-webdriver';

export class ProtractorElementLocator<T extends WebElement> extends UIElementLocator<T> {
    constructor(private readonly fn: (locator: Locator) => T) {
        super();

        this.when(ByCss,                location => this.asUIElement(this.fn(by.css(location.value))))
            .when(ByCssContainingText,  location => this.asUIElement(this.fn(by.cssContainingText(location.value, location.text) as Locator)))
            .when(ById,                 location => this.asUIElement(this.fn(by.id(location.value))))
            .when(ByName,               location => this.asUIElement(this.fn(by.name(location.value))))
            .when(ByLinkText,           location => this.asUIElement(this.fn(by.linkText(location.value))))
            .when(ByPartialLinkText,    location => this.asUIElement(this.fn(by.partialLinkText(location.value))))
            .when(ByTagName,            location => this.asUIElement(this.fn(by.tagName(location.value))))
            .when(ByXPath,              location => this.asUIElement(this.fn(by.xpath(location.value))))
    }

    /**
     * Hides the `then` method of ElementFinder so that it works when wrapped
     * in a promise
     *
     * @see https://github.com/angular/protractor/blob/release-7.0/lib/element.ts#L830-L843
     *
     * @param {T} elementFinder
     * @returns {Promise<T>>}
     * @private
     */
    private asUIElement(elementFinder: T): Promise<T> {
        return Promise.resolve(new Proxy(elementFinder, {
            has: (target, property) =>
                property !== 'then',
            ownKeys: (target) =>
                Reflect.ownKeys(target)
                    .filter(property => property !== 'then'),
            get: (target, property, receiver) =>
                (property in receiver)
                    ? target[property]
                    : undefined,
        }));
    }
}
