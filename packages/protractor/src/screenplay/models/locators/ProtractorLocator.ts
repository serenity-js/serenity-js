import { f, LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ByDeepCss, ById, ByTagName, ByXPath, Locator, PageElement, RootLocator, Selector } from '@serenity-js/web';
import * as protractor from 'protractor';

import { unpromisedWebElement } from '../../unpromisedWebElement';
import { ProtractorErrorHandler } from '../ProtractorErrorHandler';
import { ProtractorPageElement } from '../ProtractorPageElement';
import { ProtractorRootLocator } from './ProtractorRootLocator';

/**
 * Protractor-specific implementation of {@apilink Locator}.
 *
 * @group Models
 */
export class ProtractorLocator extends Locator<protractor.ElementFinder, protractor.Locator> {

    constructor(
        parent: RootLocator<protractor.ElementFinder>,
        selector: Selector,
        private readonly errorHandler: ProtractorErrorHandler,
    ) {
        super(parent, selector);
    }

    // todo: refactor; replace with a map and some more generic lookup mechanism
    protected nativeSelector(): protractor.Locator {
        if (this.selector instanceof ByCss) {
            return protractor.by.css(this.selector.value);
        }

        if (this.selector instanceof ByDeepCss) {
            if (! protractor.by.shadowDomCss) {
                throw new LogicError(`By.deepCss() requires query-selector-shadow-dom plugin, which Serenity/JS ProtractorFrameworkAdapter registers by default. If you're using Serenity/JS without ProtractorFrameworkAdapter, please register the plugin yourself.`)
            }

            return protractor.by.shadowDomCss(this.selector.value.replace('>>>', '').trim());
        }

        if (this.selector instanceof ByCssContainingText) {
            return protractor.by.cssContainingText(this.selector.value, this.selector.text);
        }

        if (this.selector instanceof ById) {
            return protractor.by.id(this.selector.value);
        }

        if (this.selector instanceof ByTagName) {
            return protractor.by.tagName(this.selector.value);
        }

        if (this.selector instanceof ByXPath) {
            return protractor.by.xpath(this.selector.value);
        }

        throw new LogicError(f `${ this.selector } is not supported by ${ this.constructor.name }`);
    }

    async isPresent(): Promise<boolean> {
        try {
            const element = await this.resolveNativeElement();
            return Boolean(element);
        }
        catch {
            return false;
        }
    }

    async nativeElement(): Promise<protractor.ElementFinder> {
        try {
            return await this.resolveNativeElement();
        }
        catch (error) {
            return await this.errorHandler.executeIfHandled(error, () => this.resolveNativeElement());
        }
    }

    private async resolveNativeElement(): Promise<protractor.ElementFinder> {
        const parent = await this.parent.nativeElement();
        const result = await unpromisedWebElement(parent.element(this.nativeSelector()));

        // checks if the element can be interacted with; in particular, throws unexpected alert present if there is one
        await result.isPresent();

        return result;
    }

    async allNativeElements(): Promise<Array<protractor.ElementFinder>> {
        const parent = await this.parent.nativeElement();
        return parent.all(this.nativeSelector()) as unknown as Array<protractor.ElementFinder>;
    }

    of(parent: ProtractorLocator): Locator<protractor.ElementFinder, protractor.Locator> {
        return new ProtractorLocator(parent, this.selector, this.errorHandler);
    }

    locate(child: ProtractorLocator): Locator<protractor.ElementFinder, any> {
        return new ProtractorLocator(this, child.selector, this.errorHandler);
    }

    element(): PageElement<protractor.ElementFinder> {
        return new ProtractorPageElement(this);
    }

    async allElements(): Promise<Array<PageElement<protractor.ElementFinder>>> {
        const elements      = await this.allNativeElements();

        return Promise.all(elements.map(childElement =>
            new ProtractorPageElement(
                new ExistingElementLocator(
                    this.parent as ProtractorRootLocator,
                    this.selector,
                    this.errorHandler,
                    unpromisedWebElement(childElement)
                )
            )
        ));
    }
}

/**
 * @private
 */
class ExistingElementLocator extends ProtractorLocator {
    constructor(
        parent: ProtractorRootLocator,
        selector: Selector,
        errorHandler: ProtractorErrorHandler,
        private readonly existingNativeElement: protractor.ElementFinder,
    ) {
        super(parent, selector, errorHandler);
    }

    async nativeElement(): Promise<protractor.ElementFinder> {
        return this.existingNativeElement;
    }

    async allNativeElements(): Promise<Array<protractor.ElementFinder>> {
        return [ this.existingNativeElement ];
    }
}
