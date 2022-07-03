import { f, LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ByDeepCss, ById, ByTagName, ByXPath, Locator, PageElement, RootLocator, Selector } from '@serenity-js/web';
import * as protractor from 'protractor';

import { unpromisedWebElement } from '../../unpromisedWebElement';
import { ProtractorPageElement } from '../ProtractorPageElement';
import { ProtractorRootLocator } from './ProtractorRootLocator';

export class ProtractorLocator extends Locator<protractor.ElementFinder, protractor.Locator> {

    constructor(
        parent: RootLocator<protractor.ElementFinder>,
        selector: Selector,
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

    // todo: refactor; lift method to Locator
    async nativeElement(): Promise<protractor.ElementFinder> {
        const parent = await this.parent.nativeElement();
        return unpromisedWebElement(parent.element(this.nativeSelector()));
    }

    async allNativeElements(): Promise<Array<protractor.ElementFinder>> {
        const parent = await this.parent.nativeElement();
        return parent.all(this.nativeSelector()) as unknown as Array<protractor.ElementFinder>;
    }

    of(parent: ProtractorLocator): Locator<protractor.ElementFinder, protractor.Locator> {
        return new ProtractorLocator(parent, this.selector);
    }

    locate(child: ProtractorLocator): Locator<protractor.ElementFinder, any> {
        return new ProtractorLocator(this, child.selector);
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
        private readonly existingNativeElement: protractor.ElementFinder,
    ) {
        super(parent, selector);
    }

    async nativeElement(): Promise<protractor.ElementFinder> {
        return this.existingNativeElement;
    }

    async allNativeElements(): Promise<Array<protractor.ElementFinder>> {
        return [ this.existingNativeElement ];
    }
}
