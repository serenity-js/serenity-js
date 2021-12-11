import { Ability, LogicError, UsesAbilities } from '@serenity-js/core';
import { Browser, BrowserContext, BrowserType, ElementHandle, Frame, LaunchOptions, Mouse, Page, Response } from 'playwright';

import { Stack } from '../../utils';
import { NavigateOptions } from '../interactions';
import { ScreenshotOptions } from '../options/screenshotOptions';

type Context = Page | Frame;

/**
 * @desc
 *  An {@link @serenity-js/core/lib/screenplay~Ability} that enables the {@link Actor} to interact with web front-ends using {@link protractor}.
 *
 * @example <caption>Using the protractor.browser</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { BrowseTheWeb, Navigate, Target } from 'serenityjs-playwright';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { chromium } from 'playwright';
 *
 *  const actor = Actor.named('Wendy').whoCan(
 *      BrowseTheWeb.using(chromium),
 *  );
 *
 *  const HomePage = {
 *      Title: Target.the('title').located(by.css('h1')),
 *  };
 *
 *  actor.attemptsTo(
 *      Navigate.to(`https://serenity-js.org`),
 *      Ensure.that(Text.of(HomePage.Title), equals('Serenity/JS')),
 *  );
 *
 * @see https://www.protractortest.org/
 *
 * @public
 * @implements {@serenity-js/core/lib/screenplay~Ability}
 * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
 */
export class BrowseTheWeb implements Ability {
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

    private _lastScriptExecutionResult: unknown;

    /**
     * @desc
     *  Ability to interact with web front-ends using a given playwright browser instance.
     *
     * @param {Browser} browserType
     * @returns {BrowseTheWeb}
     */
    public static using(browserType: BrowserType): BrowseTheWeb {
        return new BrowseTheWeb(browserType);
    }

    /**
     * @desc
     *  Used to access the Actor's ability to {@link BrowseTheWeb} from within the {@link Interaction} classes,
     *  such as {@link Navigate}.
     *
     * @param {UsesAbilities} actor
     * @return {BrowseTheWeb}
     */
    public static as(actor: UsesAbilities): BrowseTheWeb {
        if (!this.actorMap.has(actor)) {
            this.actorMap.set(actor, actor.abilityTo(BrowseTheWeb));
        }
        return this.actorMap.get(actor);
    }

    /**
     * @param {Browser} browser
     *  An instance of a protractor browser
     */
    private constructor(protected browserType: BrowserType) {
        this.storedContext = new Stack();
    }

    public withOptions(options: LaunchOptions): BrowseTheWeb {
        this.launchOptions = options;
        return this;
    }

    /**
     * @desc
     *  Navigate to the given destination and loads mock modules before Angular.
     *  Assumes that the page being loaded uses Angular.
     *
     * @param {string} destination
     * @param {number?} timeoutInMillis
     *
     * @returns {Promise<void>}
     */
    async open(
        destination: string,
        options?: {
            referer?: string;
            timeout?: number;
            waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
        },
    ): Promise<Response> {
        const workingContext = await this.workingContext();
        return workingContext.goto(destination, options);
    }

    /**
     * @desc
     *  Interface for navigating back and forth in the browser history.
     *
     *  @returns {Navigation}
     */
    async navigate(
        where: 'back' | 'forward' | 'reload',
        options: NavigateOptions,
    ): Promise<Response> {
        const page = await this.page();
        switch (where) {
            case 'back':
                return page.goBack(options);
            case 'forward':
                return page.goForward(options);
            default:
                return page.reload(options);
        }
    }

    /**
     * @desc
     *  Interface for defining sequences of complex user interactions.
     *
     * @returns {ActionSequence}
     *
     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/actions.html
     */
    async mouse(): Promise<Mouse> {
        const page = await this.page();
        return page.mouse;
    }

    /**
     * @desc
     *  Interface for managing browser and driver state.
     *
     * @returns {Options}
     *
     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebDriver.html#manage
     */
    context(): Promise<BrowserContext> {
        return this.browserContext();
    }

    /**
     * @desc
     *  returns Fram by a selector
     *
     * @param {string} selector
     *
     * @returns {Promise<Frame>}
     */
    public async getFrame(selector: string): Promise<Frame> {
        const page = await this.workingContext();
        const element = await page.$(selector)
        return element.contentFrame();
    }

    /**
     * @desc
     *  Closes the browser
     *
     * @returns {Promise<void>}
     */
    async closeBrowser(): Promise<void> {
        const browser = await this.browser();
        await browser.close();
        this._browser = undefined;
        this.clearContext();
    }

    /**
     * @desc
     *  Closes the browser
     *
     * @returns {Promise<void>}
     */
    async closePage(): Promise<void> {
        const page = await this.page();
        await page.close();
        this._page = undefined;
        this.clearContext();
    }

    /**
     * @desc
     *  Closes the browser
     *
     * @returns {Promise<void>}
     */
    async closeAllOtherWindows(): Promise<void> {
        const windows = await this.pages();
        const windowToKeep = await this.page();
        const windowsToClose = windows.filter((window) => window !== windowToKeep);
        await Promise.all(windowsToClose.map((window) => window.close()));
    }

    /**
     * @desc
     *  Locates a single element identified by the selector
     *
     * @param {string} selector
     * @returns {Promise<ElementHandle>}
     */
    public async $(selector: string): Promise<ElementHandle> {
        const workingContext = await this.workingContext();
        return workingContext.$(selector);
    }

    /**
     * @desc
     *  Locates all elements identified by the selector
     *
     * @param {string} selector
     * @returns {Promise<ElementHandle[]>}
     */
    public async $$(selector: string): Promise<ElementHandle[]> {
        const workingContext = await this.workingContext();
        return workingContext.$$(selector);
    }

    public async waitForSelector(
        selector: string,
        options: PageWaitForSelectorOptions,
    ): Promise<null | ElementHandle> {
        const workingContext = await this.workingContext();
        return workingContext.waitForSelector(selector, options);
    }

    public async click(
        selector: string,
        options?: {
            button?: 'left' | 'right' | 'middle';
            clickCount?: number;
            delay?: number;
            force?: boolean;
            modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
            noWaitAfter?: boolean;
            position?: {
                x: number;
                y: number;
            };
            timeout?: number;
            trial?: boolean;
        },
    ): Promise<void> {
        const workingContext = await this.workingContext();
        return workingContext.click(selector, options);
    }

    public async doubleClick(selector: string): Promise<void> {
        const workingContext = await this.workingContext();
        return workingContext.dblclick(selector);
    }

    public async hover(selector: string): Promise<void> {
        const workingContext = await this.workingContext();
        return workingContext.hover(selector);
    }

    /**
     * @desc
     *  Evaluates the function on the page with arguments
     *
     * @param {PageFunction<any[], unknown>} script
     * @param {any[]} args
     *
     * @returns {Promise<unknown>}
     *
     * @see {@link BrowseTheWeb#getLastScriptExecutionResult}
     */
    //public async evaluate<Argument, R>(
    //    script: PageFunction<Argument, R>,
    //    args: Argument,
    //): Promise<R> {
    //    const workingContext = await this.workingContext();
    //    const result = await workingContext.evaluate(script, args);
    //    this._lastScriptExecutionResult = result;
    //    return result;
    //}

    public lastScriptExecutionResult(): unknown {
        return this._lastScriptExecutionResult;
    }

    /**
     * @desc
     *  Schedule a command to take a screenshot. The driver makes a best effort to
     *  return a base64-encoded screenshot of the following, in order of preference:
     *
     *  1. Entire page
     *  2. Current window
     *  3. Visible portion of the current frame
     *  4. The entire display containing the browser
     *
     * @return {Promise<string>} A promise that will be resolved to a base64-encoded screenshot PNG
     */
    public async takeScreenshot(options?: ScreenshotOptions): Promise<Buffer> {
        const page = await this.page();
        return page.screenshot(options);
    }

    /**
     * @desc
     *  Returns the title of the current page.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title
     *
     * @returns {Promise<string>}
     */
    public async getPageTitle(): Promise<string> {
        const page = await this.page();
        return page.title();
    }

    /**
     * @desc
     *  Returns the url of the current page.
     *
     * @returns {Promise<string>}
     */
    public async getCurrentUrl(): Promise<string> {
        const page = await this.page();
        return page.url();
    }

    /**
     * @desc
     *  Pause the actor flow for a specified number of milliseconds.
     *
     * @param {number} millis
     * @returns {Promise<void>}
     */
    public async waitForTimeout(millis: number): Promise<void> {
        const page = await this.page();
        return page.waitForTimeout(millis);
    }

    /**
     * @desc
     * Resizes browser window
     */
    public async resizeBrowserWindow(size: {
        height: number;
        width: number;
    }): Promise<void> {
        const page = await this.page();
        page.setViewportSize(size);
    }

    /**
     * @desc
     * Resizes browser window
     */
    public async windowSize(): Promise<{
        height: number;
        width: number;
    }> {
        const page = await this.page();
        return page.viewportSize();
    }

    public async switchToFrame(
        handleOrNameOrIndex: ElementHandle | number | string,
    ): Promise<void> {
        const frame = await this.normalizeFrame(handleOrNameOrIndex);
        this.setWorkingContext(frame);
    }

    public async switchToParentFrame(): Promise<void> {
        const context = await this.workingContext();
        if ((
            context as Frame
        ).parentFrame) {
            if ((
                context as Frame
            ).parentFrame()) {
                this.setWorkingContext((
                    context as Frame
                ).parentFrame());
            } else {
                this.setWorkingContext(await this.page());
            }
        }
    }

    public async switchToDefaultContent(): Promise<void> {
        this.setWorkingContext(await this.page());
    }

    public async switchToWindow(nameOrIndex: string | number): Promise<void> {
        const type = typeof nameOrIndex;
        const context = await this.context();
        switch (type) {
            case 'number': {
                this.setWorkingContext(
                    context.pages()[nameOrIndex as number],
                );
                break;
            }
            case 'string': {
                const pagesWithTitles = await Promise.all(context
                    .pages()
                    .map(async (page) => (
                        { page, title: await page.title() }
                    )));
                this.setWorkingContext(
                    pagesWithTitles.find(
                        (pageWithTitle) => pageWithTitle.title === nameOrIndex,
                    ).page,
                );
                break;
            }
            default:
                throw new Error(
                    'Unsupported window name or index type. How did you even get here? Don\'t use \'any\', I\'m watching you.',
                );
        }
    }

    public async memorizeContext(): Promise<string> {
        this.storedContext.push(await this.workingContext());
        return '';
    }

    public async restoreContext(): Promise<void> {
        this.setWorkingContext(this.storedContext.pop());
    }

    public async switchToLastOpenedWindow(): Promise<void> {
        const pages = await this.pages();
        if (1 === pages.length) {
            throw new LogicError(`No new window has been opened to switch to`);
        }
        this.setWorkingContext(pages[pages.length - 1]);
    }

    public async switchToOriginalWindow(): Promise<void> {
        const pages = await this.pages();
        if (1 === pages.length) {
            throw new LogicError(
                `Only one window is open - already on original window`,
            );
        }
        this.setWorkingContext(pages[0]);
    }

    private async normalizeFrame(
        nameorIndexOrHandle: string | number | ElementHandle,
    ): Promise<Frame> {
        const page = await this.page();
        const type = typeof nameorIndexOrHandle;
        switch (type) {
            case 'number': {
                return page.frames()[nameorIndexOrHandle as number];
            }
            case 'string': {
                return page.frame({ name: nameorIndexOrHandle as string });
            }
            default: {
                return (
                    nameorIndexOrHandle as ElementHandle
                ).contentFrame();
            }
        }
    }
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
