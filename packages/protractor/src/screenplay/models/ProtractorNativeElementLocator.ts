import { LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ById, ByTagName, ByXPath, NativeElementLocator, Selector } from '@serenity-js/web';
import { by, ElementFinder } from 'protractor';

import { promisedWebElement } from '../promisedWebElement';
import { ProtractorNativeElementRoot } from './ProtractorNativeElementRoot';

export class ProtractorNativeElementLocator implements NativeElementLocator<ElementFinder> {
    constructor(private readonly resolver: () => Promise<ProtractorNativeElementRoot> | ProtractorNativeElementRoot) {
    }

    async locate<Parameters extends unknown[]>(selector: Selector<Parameters>): Promise<ElementFinder> {
        const resolver = await this.resolver();
        if (selector instanceof ByCss) {
            return promisedWebElement(resolver.element(by.css(selector.parameters[0])));
        }

        if (selector instanceof ByCssContainingText) {
            return promisedWebElement(resolver.element(by.cssContainingText(selector.parameters[0], selector.parameters[1])));
        }

        if (selector instanceof ById) {
            return promisedWebElement(resolver.element(by.id(selector.parameters[0])));
        }

        if (selector instanceof ByTagName) {
            return promisedWebElement(resolver.element(by.tagName(selector.parameters[0])));
        }

        if (selector instanceof ByXPath) {
            return promisedWebElement(resolver.element(by.xpath(selector.parameters[0])));
        }

        throw new LogicError(`Selector ${ selector } not supported`);
    }

    async locateAll<Parameters extends unknown[]>(selector: Selector<Parameters>): Promise<Array<ElementFinder>> {
        const resolver = await this.resolver();
        const all = resolver.element.all || resolver.all;

        if (selector instanceof ByCss) {
            const eaf: ElementFinder[] = await all(by.css(selector.parameters[0]));
            return Promise.all(eaf.map(element => promisedWebElement(element)));
        }

        if (selector instanceof ByTagName) {
            const eaf: ElementFinder[] = await all(by.tagName(selector.parameters[0]));
            return Promise.all(eaf.map(element => promisedWebElement(element)));
        }

        if (selector instanceof ByXPath) {
            const eaf: ElementFinder[] = await all(by.xpath(selector.parameters[0]));
            return Promise.all(eaf.map(element => promisedWebElement(element)));
        }

        throw new LogicError(`Selector ${ selector } not supported`);
    }
}
