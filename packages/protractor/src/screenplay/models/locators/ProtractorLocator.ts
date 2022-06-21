import { f, LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ById, ByTagName, ByXPath, Locator, PageElement, Selector } from '@serenity-js/web';
import * as protractor from 'protractor';
import { ElementFinder } from 'protractor';

import { unpromisedWebElement } from '../../unpromisedWebElement';
import { ProtractorPageElement } from '../ProtractorPageElement';
import { ProtractorNativeElementRoot } from './ProtractorNativeElementRoot';

export class ProtractorLocator extends Locator<protractor.ElementFinder, ProtractorNativeElementRoot, protractor.Locator> {

    // todo: refactor; replace with a map and some more generic lookup mechanism
    protected nativeSelector(): protractor.Locator {
        if (this.selector instanceof ByCss) {
            return this.selector.value.startsWith('>>>') && !! protractor.by.shadowDomCss
                ? protractor.by.shadowDomCss(this.selector.value.replace('>>>', ''))
                : protractor.by.css(this.selector.value);
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
        const parent = await this.parentRoot();
        return unpromisedWebElement(parent.element(this.nativeSelector()));
    }

    // todo: refactor; lift method to Locator
    protected async allNativeElements(): Promise<Array<protractor.ElementFinder>> {
        const parent = await this.parentRoot();
        return parent.all(this.nativeSelector()) as unknown as Array<protractor.ElementFinder>;
    }

    of(parent: ProtractorLocator): Locator<protractor.ElementFinder, ProtractorNativeElementRoot, protractor.Locator> {
        return new ProtractorLocator(() => parent.nativeElement(), this.selector);
    }

    locate(child: ProtractorLocator): Locator<protractor.ElementFinder, ProtractorNativeElementRoot, any> {
        return new ProtractorLocator(() => this.nativeElement(), child.selector);
    }

    element(): PageElement<protractor.ElementFinder> {
        return new ProtractorPageElement(this);
    }

    async allElements(): Promise<Array<PageElement<protractor.ElementFinder>>> {
        const elements      = await this.allNativeElements();

        return Promise.all(elements.map(childElement =>
            new ProtractorPageElement(
                new ExistingElementLocator(
                    this.parentRoot,
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
        parentRoot: () => Promise<ProtractorNativeElementRoot> | ProtractorNativeElementRoot,
        selector: Selector,
        private readonly existingNativeElement: ElementFinder,
    ) {
        super(parentRoot, selector);
    }

    async nativeElement(): Promise<ElementFinder> {
        return this.existingNativeElement;
    }

    protected async allNativeElements(): Promise<Array<ElementFinder>> {
        return [ this.existingNativeElement ];
    }
}
