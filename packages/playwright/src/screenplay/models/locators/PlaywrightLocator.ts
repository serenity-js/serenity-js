import { f, LogicError } from '@serenity-js/core';
import type { PageElement, RootLocator, Selector } from '@serenity-js/web';
import { ByCss, ByCssContainingText, ByDeepCss, ById, ByTagName, ByXPath, Locator } from '@serenity-js/web';
import type * as playwright from 'playwright-core';

import { SerenitySelectorEngines } from '../../../selector-engines';
import { promised } from '../../promised';
import { PlaywrightPageElement } from '../PlaywrightPageElement';
import type { PlaywrightRootLocator } from './PlaywrightRootLocator';

/**
 * Playwright-specific implementation of [`Locator`](https://serenity-js.org/api/web/class/Locator/).
 *
 * @group Models
 */
export class PlaywrightLocator extends Locator<playwright.Locator, string> {

    constructor(
        parent: RootLocator<playwright.Locator>,
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
            await parent.locator(this.nativeSelector()).first().waitFor({ state: 'attached', timeout: 250 });

            return true;
        }
        catch (error) {
            if (error.name === 'TimeoutError') {
                return false;
            }

            throw error;
        }
    }

    async nativeElement(): Promise<playwright.Locator> {
        const parent = await this.parent.nativeElement();

        return promised(parent.locator(this.nativeSelector()));
    }

    async allNativeElements(): Promise<Array<playwright.Locator>> {
        const parent = await this.parent.nativeElement();

        if (! parent) {
            return [];
        }

        return promised(parent.locator(this.nativeSelector()).all());
    }

    of(parent: PlaywrightRootLocator): Locator<playwright.Locator, string> {
        return new PlaywrightLocator(parent, this.selector);
    }

    closestTo(child: PlaywrightLocator): Locator<playwright.Locator, string> {
        return new PlaywrightParentElementLocator(this.parent, this.selector, child);
    }

    locate(child: PlaywrightLocator): Locator<playwright.Locator, string> {
        return new PlaywrightLocator(this, child.selector);
    }

    element(): PageElement<playwright.Locator> {
        return new PlaywrightPageElement(this);
    }

    async allElements(): Promise<Array<PageElement<playwright.Locator>>> {
        const elements = await this.allNativeElements();

        return elements.map(childElement =>
            new PlaywrightPageElement(
                new PlaywrightExistingElementLocator(
                    this.parent as PlaywrightRootLocator,
                    this.selector,
                    childElement,
                )
            )
        );
    }
}

/**
 * @internal
 */
export class PlaywrightExistingElementLocator extends PlaywrightLocator {
    constructor(
        parent: RootLocator<playwright.Locator>,
        selector: Selector,
        private readonly existingNativeElement: playwright.Locator,
    ) {
        super(parent, selector);
    }

    async nativeElement(): Promise<playwright.Locator> {
        return this.existingNativeElement;
    }

    async allNativeElements(): Promise<Array<playwright.Locator>> {
        return [ this.existingNativeElement ];
    }
}

class PlaywrightParentElementLocator extends PlaywrightLocator {
    constructor(
        parent: RootLocator<playwright.Locator>,
        selector: Selector,
        private readonly child: PlaywrightLocator
    ) {
        super(parent, selector);
    }

    override async nativeElement(): Promise<playwright.Locator> {
        const cssSelector = this.asCssSelector(this.selector);
        const child = await this.child.nativeElement();

        return child.locator(`${ SerenitySelectorEngines.engineIdOf('closest') }=${ cssSelector.value }`)
    }

    async allNativeElements(): Promise<Array<playwright.Locator>> {
        return [ await this.nativeElement() ];
    }
}
