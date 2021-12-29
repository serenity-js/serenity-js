import { format, LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ById, ByTagName, ByXPath, NativeElementLocator, Selector } from '@serenity-js/web';
import { by, ElementFinder, Locator } from 'protractor';
import { match } from 'tiny-types';

import { promisedWebElement } from '../promisedWebElement';
import { ProtractorNativeElementRoot } from './ProtractorNativeElementRoot';

const f = format({ markQuestions: false });

export class ProtractorNativeElementLocator implements NativeElementLocator<ElementFinder> {
    constructor(private readonly resolver: () => Promise<ProtractorNativeElementRoot> | ProtractorNativeElementRoot) {
    }

    async locate<T>(selector: Selector<T>): Promise<ElementFinder> {
        const resolver = await this.resolver();

        const byLocator = match<Selector<unknown>, Locator>(selector)
            .when(ByCss, (s: ByCss) =>
                by.css(s.value)
            )
            .when(ByCssContainingText, (s: ByCssContainingText) =>
                by.cssContainingText(s.value, s.text)
            )
            .when(ById, (s: ById) =>
                by.id(s.value)
            )
            .when(ByTagName, (s: ByTagName) =>
                by.tagName(s.value)
            )
            .when(ByXPath, (s: ByXPath) =>
                by.xpath(s.value)
            )
            .else(() => {
                throw new LogicError(f `Selector ${ selector } not supported`);
            });

        return promisedWebElement(resolver.element(byLocator));
    }

    async locateAll<T>(selector: Selector<T>): Promise<Array<ElementFinder>> {
        const resolver = await this.resolver();
        const all = resolver.element.all || resolver.all;

        const byLocator = match<Selector<unknown>, Locator>(selector)
            .when(ByCss, (s: ByCss) =>
                by.css(s.value)
            )
            .when(ByTagName, (s: ByTagName) =>
                by.tagName(s.value)
            )
            .when(ByXPath, (s: ByXPath) =>
                by.xpath(s.value)
            )
            .else(() => {
                throw new LogicError(f `Selector ${ selector } not supported`);
            });

        const eaf: ElementFinder[] = await all(byLocator);

        return Promise.all(eaf.map(element =>
            promisedWebElement(element)
        ));
    }
}
