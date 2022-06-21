import { f, LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ById, ByTagName, ByXPath, Locator, PageElement, Selector } from '@serenity-js/web';
import * as playwright from 'playwright';

import { PlaywrightPageElement } from '../PlaywrightPageElement';
import { PlaywrightNativeElementRoot } from './PlaywrightNativeElementRoot';

export class PlaywrightLocator extends Locator<playwright.ElementHandle, PlaywrightNativeElementRoot, string> {

    // todo: refactor; replace with a map and some more generic lookup mechanism
    protected nativeSelector(): string {
        if (this.selector instanceof ByCss) {
            return this.selector.value;
        }

        if (this.selector instanceof ByCssContainingText) {
            return `${ this.selector.value }:has-text("${ this.selector.text }")`;
        }

        if (this.selector instanceof ById) {
            return `#${ this.selector.value }`;
        }

        if (this.selector instanceof ByTagName) {
            return this.selector.value;
        }

        if (this.selector instanceof ByXPath) {
            return `xpath=${ this.selector.value }`;
        }

        throw new LogicError(f `${ this.selector } is not supported by ${ this.constructor.name }`);
    }

    // todo: refactor; lift method to Locator
    async nativeElement(): Promise<playwright.ElementHandle> {
        const parent = await this.parentRoot();
        return parent.$(this.nativeSelector());
    }

    // todo: refactor; lift method to Locator
    protected async allNativeElements(): Promise<Array<playwright.ElementHandle>> {
        const parent = await this.parentRoot();
        return parent.$$(this.nativeSelector());
    }

    of(parent: PlaywrightLocator): Locator<playwright.ElementHandle, PlaywrightNativeElementRoot, string> {
        return new PlaywrightLocator(() => parent.nativeElement(), this.selector);
    }

    locate(child: PlaywrightLocator): Locator<playwright.ElementHandle, PlaywrightNativeElementRoot, string> {
        return new PlaywrightLocator(() => this.nativeElement(), child.selector);
    }

    element(): PageElement<playwright.ElementHandle> {
        return new PlaywrightPageElement(this);
    }

    async allElements(): Promise<Array<PageElement<playwright.ElementHandle>>> {
        const elements = await this.allNativeElements();

        return elements.map(childElement =>
            new PlaywrightPageElement(
                new ExistingElementLocator(
                    () => this.parentRoot(),
                    this.selector,
                    childElement,
                )
            )
        );
    }
}

/**
 * @private
 */
class ExistingElementLocator extends PlaywrightLocator {
    constructor(
        parentRoot: () => Promise<PlaywrightNativeElementRoot> | PlaywrightNativeElementRoot,
        selector: Selector,
        private readonly existingNativeElement: playwright.ElementHandle,
    ) {
        super(parentRoot, selector);
    }

    async nativeElement(): Promise<playwright.ElementHandle> {
        return this.existingNativeElement;
    }

    protected async allNativeElements(): Promise<Array<playwright.ElementHandle>> {
        return [ this.existingNativeElement ];
    }
}
