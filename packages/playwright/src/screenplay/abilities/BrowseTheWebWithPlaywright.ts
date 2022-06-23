import { Discardable, LogicError } from '@serenity-js/core';
import { BrowserCapabilities, BrowseTheWeb, Cookie, CookieData, Key, ModalDialog, Page } from '@serenity-js/web';
import * as Buffer from 'buffer';
import * as playwright from 'playwright-core';
import * as structs from 'playwright-core/types/structs';

import { PlaywrightCookie, PlaywrightPage, PlaywrightPageElement } from '../models';
import { PlaywrightOptions } from './PlaywrightOptions';

export class BrowseTheWebWithPlaywright extends BrowseTheWeb implements Discardable {

    /**
     * @param {playwright~Browser} browser
     * @param {PlaywrightOptions} options
     * @returns {BrowseTheWebWithPlaywright}
     */
    static using(browser: playwright.Browser, options?: PlaywrightOptions): BrowseTheWebWithPlaywright {
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
    protected constructor(protected readonly browser: playwright.Browser, protected readonly browserContextOptions: PlaywrightOptions = {}) {
        super();
    }

    async discard(): Promise<void> {
        if (this.currentBrowserContext) {
            await this.currentBrowserContext.close();

            this.currentBrowserContext = undefined;
            this.currentBrowserPage = undefined;
        }

        this.lastScriptExecutionSummary = undefined
    }

    async navigateTo(destination: string): Promise<void> {
        const page = await this.page();
        await page.goto(destination);
    }

    async navigateBack(): Promise<void> {
        const page = await this.page();
        await page.goBack();
    }

    async navigateForward(): Promise<void> {
        const page = await this.page();
        await page.goForward();
    }

    async reloadPage(): Promise<void> {
        const page = await this.page();
        await page.reload();
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

    async cookie(name: string): Promise<Cookie> {
        return new PlaywrightCookie(await this.context(), name);
    }

    async setCookie(cookieData: CookieData): Promise<void> {
        const context = await this.context();
        const page = await this.page();

        await context.addCookies([{
            name:       cookieData.name,
            value:      cookieData.value,
            domain:     cookieData.domain,
            path:       cookieData.path,
            url:        !(cookieData.domain && cookieData.path)
                ? await page.url()
                : undefined,
            secure:     cookieData.secure,
            httpOnly:   cookieData.httpOnly,
            expires:    cookieData.expiry
                ? cookieData.expiry.toSeconds()
                : undefined,
            sameSite:   cookieData.sameSite,
        }]);
    }

    async deleteAllCookies(): Promise<void> {
        const context = await this.context()
        await context.clearCookies();
    }

    modalDialog(): Promise<ModalDialog> {
        throw new Error('Method not implemented.');
    }

    private async context(): Promise<playwright.BrowserContext> {
        if (! this.currentBrowserContext) {
            this.currentBrowserContext = await this.browser.newContext(this.browserContextOptions);

            if (this.browserContextOptions?.defaultNavigationTimeout) {
                this.currentBrowserContext.setDefaultNavigationTimeout(this.browserContextOptions?.defaultNavigationTimeout);
            }

            if (this.browserContextOptions?.defaultTimeout) {
                this.currentBrowserContext.setDefaultTimeout(this.browserContextOptions?.defaultTimeout);
            }
        }

        return this.currentBrowserContext;
    }

    private async page(): Promise<playwright.Page> {
        if (! this.currentBrowserPage || this.currentBrowserPage.isClosed()) {
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
