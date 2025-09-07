import { f, LogicError } from '@serenity-js/core';
import type { ByRoleSelectorOptions, PageElement, RootLocator, Selector } from '@serenity-js/web';
import { ByCss, ByCssContainingText, ByDeepCss, ById, ByRole, ByTagName, ByXPath, Locator } from '@serenity-js/web';
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

        if (this.selector instanceof ByRole) {
            return getByRoleSelector(this.selector.value, this.selector.options)
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

// todo: look up types and implementation in Playwright
//  node_modules/playwright-core/lib/utils/isomorphic/locatorUtils.js

function getByRoleSelector(role: string, options: ByRoleSelectorOptions = {}) {
    const props = [];
    if (options.checked !== void 0)
        props.push(['checked', String(options.checked)]);
    if (options.disabled !== void 0)
        props.push(['disabled', String(options.disabled)]);
    if (options.selected !== void 0)
        props.push(['selected', String(options.selected)]);
    if (options.expanded !== void 0)
        props.push(['expanded', String(options.expanded)]);
    if (options.includeHidden !== void 0)
        props.push(['include-hidden', String(options.includeHidden)]);
    if (options.level !== void 0)
        props.push(['level', String(options.level)]);
    if (options.name !== void 0)
        props.push(['name', escapeForAttributeSelector(options.name, !!options.exact)]);
    if (options.pressed !== void 0)
        props.push(['pressed', String(options.pressed)]);
    return `role=${role}${props.map(([n, v]) => `[${n}=${v}]`).join('')}`;
}

function escapeForAttributeSelector(value, exact) {
    if (typeof value !== 'string')
        return escapeRegexForSelector(value);
    return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"${exact ? 's' : 'i'}`;
}

function escapeRegexForSelector(re: RegExp) {
    if (re['unicode'] || re['unicodeSets']) {
        return String(re);
    }

    return String(re).replaceAll(/(^|[^\\])(\\\\)*(["'`])/g, '$1$2\\$3').replaceAll('>>', '\\>\\>');
}
