import { LogicError } from '@serenity-js/core';
import { BrowserCapabilities, BrowseTheWeb, Cookie, CookieData, Key, ModalDialog, Page } from '@serenity-js/web';
import * as Buffer from 'buffer';
import * as playwright from 'playwright-core';
import * as structs from 'playwright-core/types/structs';

import { PlaywrightPage, PlaywrightPageElement } from '../models';

export class BrowseTheWebWithPlaywright extends BrowseTheWeb {

    /**
     * @param {playwright~Browser} browser
     * @param {playwright~BrowserContextOptions} options
     * @returns {BrowseTheWebWithPlaywright}
     */
    static using(browser: playwright.Browser, options?: playwright.BrowserContextOptions): BrowseTheWebWithPlaywright {
        return new BrowseTheWebWithPlaywright(browser, options);
    }

    private currentBrowserContext: playwright.BrowserContext;
    private currentBrowserPage: playwright.Page;

    /**
     * @private
     */
    private lastScriptExecutionSummary: LastScriptExecutionSummary;

    /**
     * @param {playwright~Browser} browser
     * @param {playwright~BrowserContextOptions} browserContextOptions
     */
    protected constructor(protected readonly browser: playwright.Browser, protected readonly browserContextOptions: playwright.BrowserContextOptions = {}) {
        super();
    }

    async navigateTo(destination: string): Promise<void> {
        const page = await this.page();
        await page.goto(destination, /* todo: consider making options configurable */)
    }

    async navigateBack(): Promise<void> {
        const page = await this.page();
        await page.goBack(/* todo: consider making options configurable */);
    }

    async navigateForward(): Promise<void> {
        const page = await this.page();
        await page.goForward(/* todo: consider making options configurable */);
    }

    async reloadPage(): Promise<void> {
        const page = await this.page();
        await page.reload(/* todo: consider making options configurable */);
    }

    async browserCapabilities(): Promise<BrowserCapabilities> {
        return {
            browserName: (this.browser as any)._initializer.name,   // todo: raise a PR to Playwright to expose this information
            platformName: process.platform,                         // todo: get the actual platform from Playwright
            browserVersion: this.browser.version()
        }
    }

    async sendKeys(keys: (string | Key)[]): Promise<void> {
        const page = await this.page();

        const keySequence = keys.map(key => {
            if (! Key.isKey(key)) {
                return key;
            }

            return key.devtoolsName;
        });

        await page.keyboard.press(
            keySequence.join('+'),
        );
    }

    async executeScript<Result, InnerArguments extends any[]>(script: string | ((...parameters: InnerArguments) => Result), ...args: InnerArguments): Promise<Result> {

        const nativeArguments = await Promise.all(
            args.map(arg =>
                arg instanceof PlaywrightPageElement
                    ? arg.nativeElement()
                    : arg
            )
        ) as InnerArguments;

        const page = await this.page();

        const serialisedScript = typeof script === 'function'
            ? String(script)
            : String(`function script() { ${ script } }`);

        const result = await page.evaluate<Result, typeof nativeArguments>(
            new Function(`
                const parameters = arguments[0];
                return (${ serialisedScript }).apply(null, parameters);
            `) as structs.PageFunction<typeof nativeArguments, Result>,
            nativeArguments
        );

        this.lastScriptExecutionSummary = new LastScriptExecutionSummary(
            result,
        );

        return result;
    }

    async executeAsyncScript<Result, Parameters extends any[]>(script: string | ((...args: [...parameters: Parameters, callback: (result: Result) => void]) => void), ...args: Parameters): Promise<Result> {

        const nativeArguments = await Promise.all(
            args.map(arg =>
                arg instanceof PlaywrightPageElement
                    ? arg.nativeElement()
                    : arg
            )
        ) as Parameters;

        const page = await this.page();

        const serialisedScript = typeof script === 'function'
            ? String(script)
            : String(`function script() { ${ script } }`);

        const result = await page.evaluate<Result, typeof nativeArguments>(
            new Function(`
                const parameters = arguments[0];
                
                return new Promise((resolve, reject) => {
                    try {
                        return (${ serialisedScript }).apply(null, parameters.concat(resolve));
                    } catch (error) {
                        return reject(error);
                    }
                })
            `) as structs.PageFunction<typeof nativeArguments, Result>,
            nativeArguments
        );

        this.lastScriptExecutionSummary = new LastScriptExecutionSummary(
            result,
        );

        return result;
    }

    /**
     * @desc
     *  Returns the last result of calling {@link BrowseTheWebWithPlaywright#executeAsyncScript}
     *  or {@link BrowseTheWebWithPlaywright#executeScript}
     *
     * @returns {any}
     */
    lastScriptExecutionResult<Result = any>(): Result {
        if (! this.lastScriptExecutionSummary) {
            throw new LogicError(`Make sure to execute a script before checking on the result`);
        }

        return this.lastScriptExecutionSummary.result as Result;
    }

    async takeScreenshot(): Promise<string> {
        const page = await this.page()
        const screenshot: Buffer = await page.screenshot();

        return screenshot.toString('base64');
    }
    async currentPage(): Promise<Page> {
        return new PlaywrightPage(await this.context(), await this.page());
    }
    async allPages(): Promise<Page[]> {
        throw new Error('Method not implemented.');
    }
    cookie(name: string): Promise<Cookie> {
        throw new Error('Method not implemented.');
    }
    setCookie(cookieData: CookieData): Promise<void> {
        throw new Error('Method not implemented.');
    }

    deleteAllCookies(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    modalDialog(): Promise<ModalDialog> {
        throw new Error('Method not implemented.');
    }

    private async context(): Promise<playwright.BrowserContext> {
        if (! this.currentBrowserContext) {
            this.currentBrowserContext = await this.browser.newContext(this.browserContextOptions);
        }

        return this.currentBrowserContext;
    }

    private async page(): Promise<playwright.Page> {
        if (! this.currentBrowserPage) {
            const context = await this.context();
            this.currentBrowserPage = await context.newPage();
        }

        return this.currentBrowserPage;
    }
}

/**
 * @package
 */
class LastScriptExecutionSummary<Result = any> {
    constructor(public readonly result: Result) {}
}
