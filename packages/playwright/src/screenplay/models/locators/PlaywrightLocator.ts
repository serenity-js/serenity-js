import { f, LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ByDeepCss, ById, ByTagName, ByXPath, Locator, PageElement, RootLocator, Selector } from '@serenity-js/web';
import type * as playwright from 'playwright-core';

import { PlaywrightPageElement } from '../PlaywrightPageElement';
import { PlaywrightRootLocator } from './PlaywrightRootLocator';

/**
 * Playwright-specific implementation of {@apilink Locator}.
 *
 * @group Models
 */
export class PlaywrightLocator extends Locator<playwright.ElementHandle, string> {

    constructor(
        parent: RootLocator<playwright.ElementHandle>,
        selector: Selector,
    ) {
        super(parent, selector);
    }

    // todo: refactor; replace with a map and some more generic lookup mechanism
    protected nativeSelector(): string {
        if (this.selector instanceof ByCss) {
            return `:light(${ this.selector.value })`;
        }

        if (this.selector instanceof ByDeepCss) {
            return this.selector.value;
        }

        if (this.selector instanceof ByCssContainingText) {
            return `:light(${ this.selector.value }):has-text("${ this.selector.text }")`;
        }

        if (this.selector instanceof ById) {
            return `id=${ this.selector.value }`;
        }

        if (this.selector instanceof ByTagName) {
            return `:light(${ this.selector.value })`;
        }

        if (this.selector instanceof ByXPath) {
            return `xpath=${ this.selector.value }`;
        }

        throw new LogicError(f`${ this.selector } is not supported by ${ this.constructor.name }`);
    }

    async isPresent(): Promise<boolean> {
        try {
            const parentPresent = await this.parent.isPresent();

            if (! parentPresent) {
                return false;
            }

            const parent = await this.parent.nativeElement();
            const element = await parent.$(this.nativeSelector());

            return Boolean(element);
        }
        catch (error) {
            if (error.name === 'TimeoutError') {
                return false;
            }
            throw error;
        }
    }

    async nativeElement(): Promise<playwright.ElementHandle> {

        const parent = await this.parent.nativeElement();

        if (! parent) {
            throw new LogicError(`Couldn't find parent element ${ this.parent } of ${ this }`);
        }

        return parent.waitForSelector(this.nativeSelector(), { state: 'attached' });
    }

    async allNativeElements(): Promise<Array<playwright.ElementHandle>> {
        const parent = await this.parent.nativeElement();

        if (! parent) {
            return [];
        }

        return parent.$$(this.nativeSelector());
    }

    of(parent: PlaywrightRootLocator): Locator<playwright.ElementHandle, string> {
        return new PlaywrightLocator(parent, this.selector);
    }

    locate(child: PlaywrightLocator): Locator<playwright.ElementHandle, string> {
        return new PlaywrightLocator(this, child.selector);
    }

    element(): PageElement<playwright.ElementHandle> {
        return new PlaywrightPageElement(this);
    }

    async allElements(): Promise<Array<PageElement<playwright.ElementHandle>>> {
        const elements = await this.allNativeElements();

        return elements.map(childElement =>
            new PlaywrightPageElement(
                new ExistingElementLocator(
                    this.parent as PlaywrightRootLocator,
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
        parent: RootLocator<playwright.ElementHandle>,
        selector: Selector,
        private readonly existingNativeElement: playwright.ElementHandle,
    ) {
        super(parent, selector);
    }

    async nativeElement(): Promise<playwright.ElementHandle> {
        return this.existingNativeElement;
    }

    async allNativeElements(): Promise<Array<playwright.ElementHandle>> {
        return [ this.existingNativeElement ];
    }
}
