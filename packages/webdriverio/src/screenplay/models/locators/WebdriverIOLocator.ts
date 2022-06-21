import { f, LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ById, ByTagName, ByXPath, Locator, PageElement, Selector } from '@serenity-js/web';
import * as wdio from 'webdriverio';

import { WebdriverIOPageElement } from '../WebdriverIOPageElement';
import { WebdriverIONativeElementRoot } from './WebdriverIONativeElementRoot';

export class WebdriverIOLocator extends Locator<wdio.Element<'async'>, WebdriverIONativeElementRoot, string> {

    // todo: refactor; replace with a map and some more generic lookup mechanism
    protected nativeSelector(): string {
        if (this.selector instanceof ByCss) {
            return this.selector.value;
        }

        if (this.selector instanceof ByCssContainingText) {
            return `${ this.selector.value }*=${ this.selector.text }`;
        }

        if (this.selector instanceof ById) {
            return `#${ this.selector.value }`;
        }

        if (this.selector instanceof ByTagName) {
            return `<${ this.selector.value } />`;
        }

        if (this.selector instanceof ByXPath) {
            return this.selector.value;
        }

        throw new LogicError(f `${ this.selector } is not supported by ${ this.constructor.name }`);
    }

    // todo: refactor; lift method to Locator
    async nativeElement(): Promise<wdio.Element<'async'>> {
        const parent = await this.parentRoot();
        return parent.$(this.nativeSelector());
    }

    // todo: refactor; lift method to Locator
    protected async allNativeElements(): Promise<Array<wdio.Element<'async'>>> {
        const parent = await this.parentRoot();
        return parent.$$(this.nativeSelector());
    }

    // todo: can I lift this?
    of(parent: WebdriverIOLocator): Locator<wdio.Element<'async'>, WebdriverIONativeElementRoot> {
        return new WebdriverIOLocator(() => parent.nativeElement(), this.selector);
    }

    // todo: can I lift this?
    locate(child: WebdriverIOLocator): Locator<wdio.Element<'async'>, WebdriverIONativeElementRoot> {
        return new WebdriverIOLocator(() => this.nativeElement(), child.selector);
    }

    element(): PageElement<wdio.Element<'async'>> {
        return new WebdriverIOPageElement(this);
    }

    async allElements(): Promise<Array<PageElement<wdio.Element<'async'>>>> {
        const elements = await this.allNativeElements();

        return elements.map(childElement =>
            new WebdriverIOPageElement(
                new ExistingElementLocator(
                    () => this.parentRoot(),
                    this.selector,
                    childElement
                )
            )
        );
    }
}

/**
 * @private
 */
class ExistingElementLocator extends WebdriverIOLocator {
    constructor(
        parentRoot: () => Promise<WebdriverIONativeElementRoot> | WebdriverIONativeElementRoot,
        selector: Selector,
        private readonly existingNativeElement: wdio.Element<'async'>,
    ) {
        super(parentRoot, selector);
    }

    async nativeElement(): Promise<wdio.Element<'async'>> {
        return this.existingNativeElement;
    }

    protected async allNativeElements(): Promise<Array<wdio.Element<'async'>>> {
        return [ this.existingNativeElement ];
    }
}
