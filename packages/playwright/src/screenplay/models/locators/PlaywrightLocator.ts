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
            return `css=${ this.selector.value }`;
        }

        if (this.selector instanceof ByDeepCss) {
            return `css=${ this.selector.value }`;
        }

        if (this.selector instanceof ByCssContainingText) {
            return `css=${ this.selector.value }:has-text("${ this.selector.text }")`;
        }

        if (this.selector instanceof ById) {
            return `id=${ this.selector.value }`;
        }

        if (this.selector instanceof ByRole) {
            return getByRoleSelector(this.selector.value, this.selector.options)
        }

        if (this.selector instanceof ByTagName) {
            return `css=${ this.selector.value }`;
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

// Playwright doesn't expose the internal locator utilities, so unfortunately we need to re-implement them here.

// https://github.com/microsoft/playwright/blob/release-1.55/packages/playwright-core/src/utils/isomorphic/locatorUtils.ts#L59
function getByRoleSelector(role: string, options: ByRoleSelectorOptions = {}): string {
    const props: string[][] = [];
    if (options.checked !== undefined) {
        props.push(['checked', String(options.checked)]);
    }
    if (options.disabled !== undefined) {
        props.push(['disabled', String(options.disabled)]);
    }
    if (options.selected !== undefined) {
        props.push(['selected', String(options.selected)]);
    }
    if (options.expanded !== undefined) {
        props.push(['expanded', String(options.expanded)]);
    }
    if (options.includeHidden !== undefined) {
        props.push(['include-hidden', String(options.includeHidden)]);
    }
    if (options.level !== undefined) {
        props.push(['level', String(options.level)]);
    }
    if (options.name !== undefined) {
        props.push(['name', escapeForAttributeSelector(options.name, !!options.exact)]);
    }
    if (options.pressed !== undefined) {
        props.push(['pressed', String(options.pressed)]);
    }

    return `role=${role}${props.map(([n, v]) => `[${n}=${v}]`).join('')}`;
}

// https://github.com/microsoft/playwright/blob/release-1.55/packages/playwright-core/src/utils/isomorphic/stringUtils.ts#L92
function escapeForAttributeSelector(value: string | RegExp, exact: boolean): string {
    if (typeof value !== 'string') {
        return escapeRegexForSelector(value);
    }
    // However, Playwright attribute selectors do not conform to CSS parsing spec,
    // so we escape them differently.
    return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"${exact ? 's' : 'i'}`;
}

// https://github.com/microsoft/playwright/blob/release-1.55/packages/playwright-core/src/utils/isomorphic/stringUtils.ts#L75
function escapeRegexForSelector(re: RegExp): string {
    // Unicode mode does not allow "identity character escapes", so Playwright does not escape and
    // hopes that it does not contain quotes and/or >> signs.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_escape
    if (re['unicode'] || re['unicodeSets']) {
        return String(re);
    }
    // Even number of backslashes followed by the quote -> insert a backslash.
    return String(re).replaceAll(/(^|[^\\])(\\\\)*(["'`])/g, '$1$2\\$3').replaceAll('>>', '\\>\\>');
}
