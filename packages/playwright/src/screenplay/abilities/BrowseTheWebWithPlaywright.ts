import { Duration, LogicError, UsesAbilities } from '@serenity-js/core';
import { BrowserCapabilities, BrowseTheWeb, Cookie, CookieData, Key, ModalDialog, Page as SerenityPage, PageElement, PageElements } from '@serenity-js/web';
import { Browser, BrowserContext, BrowserType, ElementHandle, Frame, Keyboard, LaunchOptions, Page } from 'playwright';

import { Stack } from '../../utils';
import { PlaywrightPageElement, PlaywrightPageElements, PlaywrightNativeRootElement } from '../models';
import {PlaywrightCookie} from '../models/PlaywrightCookie';
import {PlaywrightPage} from '../models/PlaywrightPage';
// import { ScreenshotOptions } from '../options/screenshotOptions';

type Context = Page | Frame;

export type Modifier = 'Shift' | 'Control' | 'Alt' | 'Meta' | 'ShiftLeft';

export interface NormalizedKey {
    key: string;
    modifiers?: Modifier[];
}

export class BrowseTheWebWithPlaywright extends BrowseTheWeb {
    private static actorMap = new Map();

    /**
     * @private
     */
    private _browseContext: BrowserContext;

    /**
     * @private
     */
    private _browser: Browser;
    /**
     * @private
     */
    private launchOptions?: LaunchOptions;

    /**
     * @private
     */
    private _page: Page;

    /**
     * @private
     */
    private _workingContext: Context;

    /**
     * @private
     */
    private storedContext: Stack<Context>;

    protected async workingContext(): Promise<Context> {
        if (!this._workingContext) {
            this._workingContext = await this.page();
        }
        return this._workingContext;
    }

    protected setWorkingContext(newContext: Context): void {
        this._workingContext = newContext;
    }

    protected clearContext(): void {
        this._workingContext = undefined;
    }

    /**
     * @private
     * @desc
     *  Playwright browser context. It's recommended by playwright to use context as wrappers around pages
     *  for frameworks
     */
    private async browser(): Promise<Browser> {
        if (!this._browser) {
            this._browser = await this.browserType.launch(this.launchOptions);
        }
        return this._browser;
    }

    /**
     * @private
     * @desc
     *  Playwright browser context. It's recommended by playwright to use context as wrappers around pages
     *  for frameworks
     */
    private async browserContext(): Promise<BrowserContext> {
        if (!this._browseContext) {
            const browser = await this.browser();
            this._browseContext = await browser.newContext()
        }
        return this._browseContext;
    }

    /**
     * @private
     * @desc
     *  Playwright browser page. It's recommended by playwright to use context as wrappers around pages
     *  for frameworks
     *
     *  This should not be public to ease up maintenance. BrowseTheWeb wroks as an anti-corruption layer for playwright API
     */
    private async page(): Promise<Page> {
        if (!this._page) {
            const browserContext = await this.browserContext();
            this._page = await browserContext.newPage();
        }
        return this._page;
    }

    /**
     * @public
     * @desc
     *  All open pages
     */
    private async pages(): Promise<Array<Page>> {
        const browserContext = await this.browserContext();
        return browserContext.pages();
    }

    private async keyboard(): Promise<Keyboard> {
        const page = await this.page();
        return page.keyboard;
    }

    /**
     * @private
     */
    private lastScriptExecutionSummary: LastScriptExecutionSummary;
    private _lastScriptExecutionResult: unknown;

    /**
     * @desc
     *  Ability to interact with web front-ends using a given playwright browser instance.
     *
     * @param {Browser} browserType
     * @returns {BrowseTheWebWithPlaywright}
     */
    public static using(browserType: BrowserType): BrowseTheWebWithPlaywright {
        return new BrowseTheWebWithPlaywright(browserType);
    }

    /**
     * @desc
     *  Used to access the Actor's ability to {@link BrowseTheWebWithPlaywright} from within the {@link Interaction} classes,
     *  such as {@link Navigate}.
     *
     * @param {UsesAbilities} actor
     * @return {BrowseTheWebWithPlaywright}
     */
    public static as(actor: UsesAbilities): BrowseTheWebWithPlaywright {
        if (!this.actorMap.has(actor)) {
            this.actorMap.set(actor, actor.abilityTo(BrowseTheWebWithPlaywright));
        }
        return this.actorMap.get(actor);
    }

    /**
     * @param {Browser} browser
     *  An instance of a protractor browser
     */
    private constructor(protected browserType: BrowserType) {
        super();
        this.storedContext = new Stack();
    }

    async navigateTo(destination: string): Promise<void> {
        const workingContext = await this.workingContext();
        await workingContext.goto(destination);
    }

    async navigateBack(): Promise<void> {
        const page = await this.page();
        page.goBack();
    }

    async navigateForward(): Promise<void> {
        const page = await this.page();
        page.goForward();
    }

    async reloadPage(): Promise<void> {
        const page = await this.page();
        page.reload();
    }

    async waitFor(duration: Duration): Promise<void> {
        const page = await this.page();
        return page.waitForTimeout(duration.inMilliseconds());
    }

    async waitUntil(condition: () => boolean | Promise<boolean>, timeout: Duration): Promise<void> {
        const page = await this.page();
        page.waitForFunction(condition, {
            timeout: timeout.inMilliseconds(),
        });
    }

    findByCss(selector: string): PageElement<any, any> {
        return this.findElement(root => root.$(selector));
    }

    findByCssContainingText(selector: string, text: string): PageElement<any, any> {
        return this.findElement(root => root.$(`text=${selector}`));
    }

    findById(selector: string): PageElement<any, any> {
        return this.findElement(root => root.$(`id=${selector}`));
    }

    findByTagName(selector: string): PageElement<any, any> {
        return this.findElement(root => root.$(selector));
    }

    findByXPath(selector: string): PageElement<any, any> {
        return this.findElement(root => root.$(`xpath=${selector}`));
    }

    private findElement(locator: (root: PlaywrightNativeRootElement) => Promise<ElementHandle>): PageElement<any, any> {
        return new PlaywrightPageElement(
            () => this.page(),
            locator as unknown as (root: PlaywrightNativeRootElement) => Promise<ElementHandle>,
        );
    }

    findAllByCss(selector: string): PageElements<any, any, any> {
        return this.findElements(root => root.$$(selector));
    }

    findAllByTagName(selector: string): PageElements<any, any, any> {
        return this.findElements(root => root.$$(selector));
    }

    findAllByXPath(selector: string): PageElements<any, any, any> {
        return this.findElements(root => root.$$(`xpath=${selector}`));
    }

    private findElements(locator: (root: PlaywrightNativeRootElement) => Promise<ElementHandle[]>): PageElements<any, any> {
        return new PlaywrightPageElements(
            () => this.page(),
            locator as unknown as (root: PlaywrightNativeRootElement) => Promise<ElementHandle[]>,
        );
    }

    async browserCapabilities(): Promise<BrowserCapabilities> {
        const browser = await this.browser();
        return {
            browserName: this.browserType.name(),
            browserVersion: browser.version(),
        };
    }

    async sendKeys(keys: (string | Key)[]): Promise<void> {
        const keyboard = await this.keyboard()
        const isModifier = (maybeKey: string | Key): boolean => {
            return Key.isKey(maybeKey) && maybeKey.isModifier;
        }

        function asString(maybeKey: string | Key): string {
            if (! Key.isKey(maybeKey)) {
                return maybeKey;
            }

            return maybeKey.devtoolsName;
        }

        const pressKey = (maybeKey: string | Key): Promise<void> => {
            if (isModifier(maybeKey)) {
                return keyboard.down(asString(maybeKey));
            }
            return keyboard.press(asString(maybeKey));
        }

        const result = keys.map(pressKey);
        keys.filter(isModifier).forEach((modifierKey) => result.push(keyboard.up(asString(modifierKey))));

        await Promise.all(result);
    }

    async executeScript<Result, InnerArguments extends any[]>(
        script: string | ((...parameters: InnerArguments) => Result),
        ...args: InnerArguments
    ): Promise<Result> {
        const nativeArguments = await Promise.all(
            args.map(
                arg => arg instanceof PlaywrightPageElement ? arg.nativeElement() : arg
            )
        ) as InnerArguments;

        const stringifyScript = (script: string | ((...parameters: InnerArguments) => Result)) =>
            typeof script === 'function'
            ? `(${script}).apply(null, [ ${nativeArguments} ])`
            : script

        const page =  await this.page();
        const stringFunction = stringifyScript(script);
        const result: Result = await page.evaluate(stringFunction, nativeArguments);
        return this.cacheExecutionResult(result);
    }

    executeAsyncScript<Result, Parameters extends any[]>(script: string | ((...args: [...parameters: Parameters, callback: (result: Result) => void]) => void), ...args: Parameters): Promise<Result> {
        throw new Error('Method not implemented.');
    }

    private cacheExecutionResult<R>(result: R): R {
        this.lastScriptExecutionSummary = new LastScriptExecutionSummary(
            result,
        );
        return result;
    }

    async currentPage(): Promise<SerenityPage> {
        const page = await this.page();
        return this.createPage(page);
    }

    async allPages(): Promise<SerenityPage[]> {
        const pages = await this.pages();
        const serenityPages = await Promise.all(pages.map((page) => this.createPage(page)));
        return serenityPages;
    }

    private async createPage(page: Page): Promise<SerenityPage> {
        return PlaywrightPage.from(page, await page.title())
    }

    async cookie(name: string): Promise<Cookie> {
        const page = await this.page();
        return PlaywrightCookie.from(name, page);
    }

    async setCookie(cookieData: CookieData): Promise<void> {
        const context = await this.browserContext();
        return context.addCookies([ cookieData ]);
    }

    async deleteAllCookies(): Promise<void> {
        const context = await this.browserContext();
        return context.clearCookies();
    }

    modalDialog(): Promise<ModalDialog> {
        throw new Error('Method not implemented.');
    }

    lastScriptExecutionResult<Result = any>(): Result {
        if (! this.lastScriptExecutionSummary) {
            throw new LogicError(`Make sure to execute a script before checking on the result`);
        }

        // Selenium returns `null` when the script it executed returns `undefined`
        // so we're mapping the result back.
        return this.lastScriptExecutionSummary.result !== null
            ? this.lastScriptExecutionSummary.result as Result
            : undefined;
    }

    async takeScreenshot(): Promise<string> {
        const page = await this.page();
        const screenhot: Buffer = await page.screenshot();
        return screenhot.toString('base64');
    }

    // todo: remove
    public async switchToFrame(
        targetOrIndex: string | number | PageElement<any, any>
    ): Promise<void> {
        throw new Error('Not implemented, yet');
    }

    // todo: remove
    public async switchToParentFrame(): Promise<void> {
        throw new Error('Not implemented, yet');
    }

    // todo: remove
    public async switchToDefaultContent(): Promise<void> {
        throw new Error('Not implemented, yet');
    }
}

/**
 * @package
 */
class LastScriptExecutionSummary<Result = any> {
    constructor(public readonly result: Result) {}
}
