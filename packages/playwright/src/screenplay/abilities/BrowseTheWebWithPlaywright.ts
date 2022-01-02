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
        // const frame = await this.normalizeFrame(targetOrIndex);
        // this.setWorkingContext(frame);
    }

    // todo: remove
    public async switchToParentFrame(): Promise<void> {
        throw new Error('Not implemented, yet');
        // const context = await this.workingContext();
        // if ((context as Frame).parentFrame) {
            // if ((
                // context as Frame
            // ).parentFrame()) {
                // this.setWorkingContext((
                    // context as Frame
                // ).parentFrame());
            // } else {
                // this.setWorkingContext(await this.page());
            // }
        // }
    }

    // todo: remove
    public async switchToDefaultContent(): Promise<void> {
        throw new Error('Not implemented, yet');
        // this.setWorkingContext(await this.page());
    }

    // private async normalizeFrame(
        // targetOrIndex: string | number | PageElement<any, any>
    // ): Promise<Frame> {
        // const page = await this.page();
        // const type = typeof targetOrIndex;
        // switch (type) {
            // case 'number': {
                // return page.frames()[targetOrIndex as number];
            // }
            // case 'string': {
                // return page.frame({ name: targetOrIndex as string });
            // }
            // default: {
                // return (
                    // targetOrIndex as ElementHandle
                // ).contentFrame();
            // }
        // }
    // }

//    public withOptions(options: LaunchOptions): BrowseTheWebWithPlaywright {
//        this.launchOptions = options;
//        return this;
//    }
//
//    /**
//     * @desc
//     *  Navigate to the given destination and loads mock modules before Angular.
//     *  Assumes that the page being loaded uses Angular.
//     *
//     * @param {string} destination
//     * @param {number?} timeoutInMillis
//     *
//     * @returns {Promise<void>}
//     */
//    async open(
//        destination: string,
//        options?: {
//            referer?: string;
//            timeout?: number;
//            waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
//        },
//    ): Promise<Response> {
//        const workingContext = await this.workingContext();
//        return workingContext.goto(destination, options);
//    }
//
//    /**
//     * @desc
//     *  Interface for navigating back and forth in the browser history.
//     *
//     *  @returns {Navigation}
//     */
//    async navigate(
//        where: 'back' | 'forward' | 'reload',
//        options: NavigateOptions,
//    ): Promise<Response> {
//        const page = await this.page();
//        switch (where) {
//            case 'back':
//                return page.goBack(options);
//            case 'forward':
//                return page.goForward(options);
//            default:
//                return page.reload(options);
//        }
//    }
//
//    /**
//     * @desc
//     *  Interface for defining sequences of complex user interactions.
//     *
//     * @returns {ActionSequence}
//     *
//     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/actions.html
//     */
//    async mouse(): Promise<Mouse> {
//        const page = await this.page();
//        return page.mouse;
//    }
//
//    /**
//     * @desc
//     *  Interface for managing browser and driver state.
//     *
//     * @returns {Options}
//     *
//     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebDriver.html#manage
//     */
//    context(): Promise<BrowserContext> {
//        return this.browserContext();
//    }
//
//    /**
//     * @desc
//     *  returns Fram by a selector
//     *
//     * @param {string} selector
//     *
//     * @returns {Promise<Frame>}
//     */
//    public async getFrame(selector: string): Promise<Frame> {
//        const page = await this.workingContext();
//        const element = await page.$(selector)
//        return element.contentFrame();
//    }
//
//    /**
//     * @desc
//     *  Closes the browser
//     *
//     * @returns {Promise<void>}
//     */
//    async closeBrowser(): Promise<void> {
//        const browser = await this.browser();
//        await browser.close();
//        this._browser = undefined;
//        this.clearContext();
//    }

   // /**
    // * @desc
    // *  Closes the browser
    // *
    // * @returns {Promise<void>}
    // */
   // private async closePage(): Promise<void> {
       // const page = await this.page();
       // await page.close();
       // this._page = undefined;
       // this.clearContext();
   // }

//    /**
//     * @desc
//     *  Closes the browser
//     *
//     * @returns {Promise<void>}
//     */
//    async closeAllOtherWindows(): Promise<void> {
//        const windows = await this.pages();
//        const windowToKeep = await this.page();
//        const windowsToClose = windows.filter((window) => window !== windowToKeep);
//        await Promise.all(windowsToClose.map((window) => window.close()));
//    }
//
//    /**
//     * @desc
//     *  Locates a single element identified by the selector
//     *
//     * @param {string} selector
//     * @returns {Promise<ElementHandle>}
//     */
//    public async $(selector: string): Promise<ElementHandle> {
//        const workingContext = await this.workingContext();
//        return workingContext.$(selector);
//    }
//
//    /**
//     * @desc
//     *  Locates all elements identified by the selector
//     *
//     * @param {string} selector
//     * @returns {Promise<ElementHandle[]>}
//     */
//    public async $$(selector: string): Promise<ElementHandle[]> {
//        const workingContext = await this.workingContext();
//        return workingContext.$$(selector);
//    }
//
//    public async waitForSelector(
//        selector: string,
//        options: PageWaitForSelectorOptions,
//    ): Promise<null | ElementHandle> {
//        const workingContext = await this.workingContext();
//        return workingContext.waitForSelector(selector, options);
//    }
//
//    public async click(
//        selector: string,
//        options?: {
//            button?: 'left' | 'right' | 'middle';
//            clickCount?: number;
//            delay?: number;
//            force?: boolean;
//            modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
//            noWaitAfter?: boolean;
//            position?: {
//                x: number;
//                y: number;
//            };
//            timeout?: number;
//            trial?: boolean;
//        },
//    ): Promise<void> {
//        const workingContext = await this.workingContext();
//        return workingContext.click(selector, options);
//    }
//
//    public async doubleClick(selector: string): Promise<void> {
//        const workingContext = await this.workingContext();
//        return workingContext.dblclick(selector);
//    }
//
//    public async hover(selector: string): Promise<void> {
//        const workingContext = await this.workingContext();
//        return workingContext.hover(selector);
//    }
//
//    /**
//     * @desc
//     *  Evaluates the function on the page with arguments
//     *
//     * @param {PageFunction<any[], unknown>} script
//     * @param {any[]} args
//     *
//     * @returns {Promise<unknown>}
//     *
//     * @see {@link BrowseTheWebWithPlaywright#getLastScriptExecutionResult}
//     */
//    //public async evaluate<Argument, R>(
//    //    script: PageFunction<Argument, R>,
//    //    args: Argument,
//    //): Promise<R> {
//    //    const workingContext = await this.workingContext();
//    //    const result = await workingContext.evaluate(script, args);
//    //    this._lastScriptExecutionResult = result;
//    //    return result;
//    //}
//
//    public lastScriptExecutionResult(): unknown {
//        return this._lastScriptExecutionResult;
//    }
//
//    /**
//     * @desc
//     *  Schedule a command to take a screenshot. The driver makes a best effort to
//     *  return a base64-encoded screenshot of the following, in order of preference:
//     *
//     *  1. Entire page
//     *  2. Current window
//     *  3. Visible portion of the current frame
//     *  4. The entire display containing the browser
//     *
//     * @return {Promise<string>} A promise that will be resolved to a base64-encoded screenshot PNG
//     */
//    public async takeScreenshot(options?: ScreenshotOptions): Promise<Buffer> {
//        const page = await this.page();
//        return page.screenshot(options);
//    }
//
//    /**
//     * @desc
//     *  Returns the title of the current page.
//     *
//     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title
//     *
//     * @returns {Promise<string>}
//     */
//    public async getPageTitle(): Promise<string> {
//        const page = await this.page();
//        return page.title();
//    }
//
//    /**
//     * @desc
//     *  Returns the url of the current page.
//     *
//     * @returns {Promise<string>}
//     */
//    public async getCurrentUrl(): Promise<string> {
//        const page = await this.page();
//        return page.url();
//    }
//
//    /**
//     * @desc
//     *  Pause the actor flow for a specified number of milliseconds.
//     *
//     * @param {number} millis
//     * @returns {Promise<void>}
//     */
//    public async waitForTimeout(millis: number): Promise<void> {
//        const page = await this.page();
//        return page.waitForTimeout(millis);
//    }
//
//    /**
//     * @desc
//     * Resizes browser window
//     */
//    public async resizeBrowserWindow(size: {
//        height: number;
//        width: number;
//    }): Promise<void> {
//        const page = await this.page();
//        page.setViewportSize(size);
//    }
//
//    /**
//     * @desc
//     * Resizes browser window
//     */
//    public async windowSize(): Promise<{
//        height: number;
//        width: number;
//    }> {
//        const page = await this.page();
//        return page.viewportSize();
//    }
//
//    public async switchToWindow(nameOrIndex: string | number): Promise<void> {
//        const type = typeof nameOrIndex;
//        const context = await this.context();
//        switch (type) {
//            case 'number': {
//                this.setWorkingContext(
//                    context.pages()[nameOrIndex as number],
//                );
//                break;
//            }
//            case 'string': {
//                const pagesWithTitles = await Promise.all(context
//                    .pages()
//                    .map(async (page) => (
//                        { page, title: await page.title() }
//                    )));
//                this.setWorkingContext(
//                    pagesWithTitles.find(
//                        (pageWithTitle) => pageWithTitle.title === nameOrIndex,
//                    ).page,
//                );
//                break;
//            }
//            default:
//                throw new Error(
//                    'Unsupported window name or index type. How did you even get here? Don\'t use \'any\', I\'m watching you.',
//                );
//        }
//    }
//
//    public async memorizeContext(): Promise<string> {
//        this.storedContext.push(await this.workingContext());
//        return '';
//    }
//
//    public async restoreContext(): Promise<void> {
//        this.setWorkingContext(this.storedContext.pop());
//    }
//
//    public async switchToLastOpenedWindow(): Promise<void> {
//        const pages = await this.pages();
//        if (1 === pages.length) {
//            throw new LogicError(`No new window has been opened to switch to`);
//        }
//        this.setWorkingContext(pages[pages.length - 1]);
//    }
//
//    public async switchToOriginalWindow(): Promise<void> {
//        const pages = await this.pages();
//        if (1 === pages.length) {
//            throw new LogicError(
//                `Only one window is open - already on original window`,
//            );
//        }
//        this.setWorkingContext(pages[0]);
//    }
//
}

interface PageWaitForSelectorOptions {
    /**
     * Defaults to `'visible'`. Can be either:
     * - `'attached'` - wait for element to be present in DOM.
     * - `'detached'` - wait for element to not be present in DOM.
     * - `'visible'` - wait for element to have non-empty bounding box and no `visibility:hidden`. Note that element without
     *   any content or with `display:none` has an empty bounding box and is not considered visible.
     * - `'hidden'` - wait for element to be either detached from DOM, or have an empty bounding box or `visibility:hidden`.
     *   This is opposite to the `'visible'` option.
     */
    state?: 'attached' | 'detached' | 'visible' | 'hidden';

    /**
     * Maximum time in milliseconds, defaults to 30 seconds, pass `0` to disable timeout. The default value can be changed by
     * using the
     * [browserContext.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-browsercontext#browsercontextsetdefaulttimeouttimeout)
     * or [page.setDefaultTimeout(timeout)](https://playwright.dev/docs/api/class-page#pagesetdefaulttimeouttimeout) methods.
     */
    timeout?: number;
}

/**
 * @package
 */
class LastScriptExecutionSummary<Result = any> {
    constructor(public readonly result: Result) {}
}
