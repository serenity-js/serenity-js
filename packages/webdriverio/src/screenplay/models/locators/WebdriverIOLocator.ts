import { f, LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ByDeepCss, ById, ByTagName, ByXPath, Locator, PageElement, RootLocator, Selector } from '@serenity-js/web';
import * as wdio from 'webdriverio';

import { WebdriverIOPageElement } from '../WebdriverIOPageElement';
import { WebdriverIORootLocator } from './WebdriverIORootLocator';

export class WebdriverIOLocator extends Locator<wdio.Element<'async'>, string> {

    constructor(
        parent: RootLocator<wdio.Element<'async'>>,
        selector: Selector,
    ) {
        super(parent, selector);
    }

    // todo: refactor; replace with a map and some more generic lookup mechanism
    protected nativeSelector(): string {
        if (this.selector instanceof ByCss) {
            return this.selector.value;
        }

        if (this.selector instanceof ByDeepCss) {
            return `>>> ${ this.selector.value }`;
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

    async nativeElement(): Promise<wdio.Element<'async'>> {
        const parent = await this.parent.nativeElement();
        return parent.$(this.nativeSelector());
    }

    async allNativeElements(): Promise<Array<wdio.Element<'async'>>> {
        const parent = await this.parent.nativeElement();
        return parent.$$(this.nativeSelector());
    }

    of(parent: WebdriverIOLocator): Locator<wdio.Element<'async'>, string> {
        return new WebdriverIOLocator(parent, this.selector);
    }

    locate(child: WebdriverIOLocator): Locator<wdio.Element<'async'>, string> {
        return new WebdriverIOLocator(this, child.selector);
    }

    element(): PageElement<wdio.Element<'async'>> {
        return new WebdriverIOPageElement(this);
    }

    async allElements(): Promise<Array<PageElement<wdio.Element<'async'>>>> {
        const elements = await this.allNativeElements();

        return elements.map(childElement =>
            new WebdriverIOPageElement(
                new ExistingElementLocator(
                    this.parent as WebdriverIORootLocator,
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
        parentRoot: RootLocator<wdio.Element<'async'>>,
        selector: Selector,
        private readonly existingNativeElement: wdio.Element<'async'>,
    ) {
        super(parentRoot, selector);
    }

    async nativeElement(): Promise<wdio.Element<'async'>> {
        return this.existingNativeElement;
    }

    async allNativeElements(): Promise<Array<wdio.Element<'async'>>> {
        return [ this.existingNativeElement ];
    }
}
