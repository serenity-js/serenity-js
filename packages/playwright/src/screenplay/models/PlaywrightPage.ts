import { LogicError } from '@serenity-js/core';
import { CorrelationId } from '@serenity-js/core/lib/model';
import { Cookie, CookieData, Key, Page, PageElement, PageElements, Selector } from '@serenity-js/web';
import * as Buffer from 'buffer';
import * as playwright from 'playwright-core';
import * as structs from 'playwright-core/types/structs';
import { URL } from 'url';

import { PlaywrightLocator, PlaywrightRootLocator } from './locators';
import { PlaywrightBrowsingSession } from './PlaywrightBrowsingSession';
import { PlaywrightPageElement } from './PlaywrightPageElement';
import { PlaywrightOptions } from '../../PlaywrightOptions';

/**
 * @desc
 *  Playwright-specific implementation of the {@link @serenity-js/web/lib/screenplay/models~Page}.
 *
 * @see {@link @serenity-js/web/lib/screenplay/models~Page}
 */
export class PlaywrightPage extends Page<playwright.ElementHandle> {
    /**
     * @private
     */
    private lastScriptExecutionSummary: LastScriptExecutionSummary;

    constructor(
        session: PlaywrightBrowsingSession,
        private readonly page: playwright.Page,
        pageId: CorrelationId,
        private readonly options: PlaywrightOptions,
    ) {
        super(session, new PlaywrightRootLocator(page), pageId);
    }

    locate(selector: Selector): PageElement<playwright.ElementHandle> {
        return new PlaywrightPageElement(
            new PlaywrightLocator(
                this.rootLocator,
                selector,
            ),
        );
    }

    locateAll(selector: Selector): PageElements<playwright.ElementHandle> {
        return new PageElements(
            new PlaywrightLocator(
                this.rootLocator,
                selector
            )
        );
    }

    async navigateTo(destination: string): Promise<void> {
        await this.page.goto(destination, { waitUntil: this.options?.defaultNavigationWaitUntil });
        await this.rootLocator.switchToMainFrame();
    }

    async navigateBack(): Promise<void> {
        await this.page.goBack({ waitUntil: this.options?.defaultNavigationWaitUntil });
        await this.rootLocator.switchToMainFrame()
    }

    async navigateForward(): Promise<void> {
        await this.page.goForward({ waitUntil: this.options?.defaultNavigationWaitUntil });
        await this.rootLocator.switchToMainFrame();
    }

    async reload(): Promise<void> {
        await this.page.reload({ waitUntil: this.options?.defaultNavigationWaitUntil });
        await this.rootLocator.switchToMainFrame();
    }

    async sendKeys(keys: (string | Key)[]): Promise<void> {
        const keySequence = keys.map(key => {
            if (! Key.isKey(key)) {
                return key;
            }

            return key.devtoolsName;
        });

        await this.page.keyboard.press(
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

        const serialisedScript = typeof script === 'function'
            ? String(script)
            : String(`function script() { ${ script } }`);

        const result = await this.page.evaluate<Result, typeof nativeArguments>(
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

        const serialisedScript = typeof script === 'function'
            ? String(script)
            : String(`function script() { ${ script } }`);

        const result = await this.page.evaluate<Result, typeof nativeArguments>(
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
        const screenshot: Buffer = await this.page.screenshot();

        return screenshot.toString('base64');
    }

    async cookie(name: string): Promise<Cookie> {
        return (this.session as PlaywrightBrowsingSession).cookie(name);
    }

    async setCookie(cookieData: CookieData): Promise<void> {
        const url = await this.page.url();

        const cookie = {
            name:       cookieData.name,
            value:      cookieData.value,
            domain:     cookieData.domain,
            path:       cookieData.path,
            url:        !(cookieData.domain && cookieData.path)
                ? url
                : undefined,
            secure:     cookieData.secure,
            httpOnly:   cookieData.httpOnly,
            expires:    cookieData.expiry
                ? cookieData.expiry.toSeconds()
                : undefined,
            sameSite:   cookieData.sameSite,
        };

        return (this.session as PlaywrightBrowsingSession).setCookie(cookie);
    }

    async deleteAllCookies(): Promise<void> {
        await (this.session as PlaywrightBrowsingSession).deleteAllCookies();
    }

    title(): Promise<string> {
        return this.page.title();
    }

    name(): Promise<string> {
        return this.page.evaluate(
            /* istanbul ignore next */
            () => window.name
        );
    }

    async url(): Promise<URL> {
        return new URL(this.page.url());
    }

    async viewportSize(): Promise<{ width: number, height: number }> {
        return this.page.viewportSize();
    }

    setViewportSize(size: { width: number, height: number }): Promise<void> {
        return this.page.setViewportSize(size);
    }

    async close(): Promise<void> {
        this.lastScriptExecutionSummary = undefined;
        await this.rootLocator.switchToMainFrame()
        return this.page.close();
    }

    async closeOthers(): Promise<void> {
        await this.session.closePagesOtherThan(this);
    }

    async isPresent(): Promise<boolean> {
        return ! this.page.isClosed();
    }
}

/**
 * @package
 */
class LastScriptExecutionSummary<Result = any> {
    constructor(public readonly result: Result) {}
}
