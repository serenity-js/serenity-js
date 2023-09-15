import 'webdriverio';

import { List, LogicError } from '@serenity-js/core';
import type { CorrelationId } from '@serenity-js/core/lib/model/index.js';
import type { Cookie, CookieData, ModalDialogHandler, PageElement, PageElements, Selector } from '@serenity-js/web';
import { BrowserWindowClosedError, ByCss, Key, Page, PageElementsLocator } from '@serenity-js/web';
import { URL } from 'url';

import { WebdriverIOExistingElementLocator, WebdriverIOLocator, WebdriverIORootLocator } from './locators/index.js';
import type { WebdriverIOBrowsingSession } from './WebdriverIOBrowsingSession.js';
import { WebdriverIOCookie } from './WebdriverIOCookie.js';
import type { WebdriverIOErrorHandler } from './WebdriverIOErrorHandler.js';
import { WebdriverIOPageElement } from './WebdriverIOPageElement.js';

/**
 * WebdriverIO-specific implementation of {@apilink Page}.
 *
 * @group Models
 */
export class WebdriverIOPage extends Page<WebdriverIO.Element> {

    private lastScriptExecutionSummary: LastScriptExecutionSummary;

    constructor(
        session: WebdriverIOBrowsingSession,
        private readonly browser: WebdriverIO.Browser,
        modalDialogHandler: ModalDialogHandler,
        private readonly errorHandler: WebdriverIOErrorHandler,
        pageId: CorrelationId,
    ) {
        super(
            session,
            new WebdriverIORootLocator(browser),
            modalDialogHandler,
            pageId,
        );
    }

    createPageElement(nativeElement: WebdriverIO.Element): PageElement<WebdriverIO.Element> {
        return new WebdriverIOPageElement(
            new WebdriverIOExistingElementLocator(
                this.rootLocator,
                new ByCss(String(nativeElement.selector)),
                this.errorHandler,
                nativeElement
            )
        );
    }

    locate(selector: Selector): PageElement<WebdriverIO.Element> {
        return new WebdriverIOPageElement(
            new WebdriverIOLocator(this.rootLocator, selector, this.errorHandler)
        )
    }

    locateAll(selector: Selector): PageElements<WebdriverIO.Element> {
        return List.of(
            new PageElementsLocator(
                new WebdriverIOLocator(this.rootLocator, selector, this.errorHandler)
            )
        );
    }

    async navigateTo(destination: string): Promise<void> {
        await this.inContextOfThisPage(() => this.browser.url(destination));
    }

    async navigateBack(): Promise<void> {
        await this.inContextOfThisPage(() => this.browser.back());
    }

    async navigateForward(): Promise<void> {
        await this.inContextOfThisPage(() => this.browser.forward());
    }

    async reload(): Promise<void> {
        await this.inContextOfThisPage(() => this.browser.refresh());
    }

    async sendKeys(keys: Array<Key | string>): Promise<void> {
        const keySequence = keys.map(key => {
            if (! Key.isKey(key)) {
                return key;
            }

            return key.utf16codePoint;
        });

        await this.inContextOfThisPage(() => this.browser.keys(keySequence));
    }

    async executeScript<Result, InnerArguments extends any[]>(
        script: string | ((...parameters: InnerArguments) => Result),
        ...args: InnerArguments
    ): Promise<Result> {
        const innerArguments = [] as InnerArguments;
        for (const arg of args) {
            const innerArgument = arg instanceof WebdriverIOPageElement
                ? await arg.nativeElement()
                : arg;

            innerArguments.push(innerArgument);
        }

        const result = await this.inContextOfThisPage<Result>(() => {
            return this.browser.execute(script, ...innerArguments);
        });

        this.lastScriptExecutionSummary = new LastScriptExecutionSummary(result);

        return result;
    }

    async executeAsyncScript<Result, Parameters extends any[]>(
        script: string | ((...args: [...parameters: Parameters, callback: (result: Result) => void]) => void),
        ...args: Parameters
    ): Promise<Result> {
        const parameters = [] as Parameters;
        for (const arg of args) {
            const parameter = arg instanceof WebdriverIOPageElement
                ? await arg.nativeElement()
                : arg;

            parameters.push(parameter);
        }

        const result = await this.inContextOfThisPage<Result>(() => {
            return this.browser.executeAsync<Result, Parameters>(script, ...parameters);
        });

        this.lastScriptExecutionSummary = new LastScriptExecutionSummary(result);

        return result;
    }

    lastScriptExecutionResult<Result = any>(): Result {
        if (! this.lastScriptExecutionSummary) {
            throw new LogicError(`Make sure to execute a script before checking on the result`);
        }

        // Selenium returns `null` when the script it executed returns `undefined`
        // so we're mapping the result back.
        return this.lastScriptExecutionSummary.result === null
            ? undefined
            : this.lastScriptExecutionSummary.result;
    }

    async takeScreenshot(): Promise<string> {
        return await this.inContextOfThisPage(async () => {
            try {
                return await this.browser.takeScreenshot();
            }
            catch (error) {

                if (error.name === 'ProtocolError' && error.message.includes('Target closed')) {
                    throw new BrowserWindowClosedError(
                        `Couldn't take screenshot since the browser window is already closed`,
                        error
                    );
                }

                throw error;
            }
        });
    }

    async cookie(name: string): Promise<Cookie> {
        return new WebdriverIOCookie(this.browser, name);
    }

    async setCookie(cookieData: CookieData): Promise<void> {
        return await this.inContextOfThisPage(() => {
            return this.browser.setCookies({
                name:       cookieData.name,
                value:      cookieData.value,
                path:       cookieData.path,
                domain:     cookieData.domain,
                secure:     cookieData.secure,
                httpOnly:   cookieData.httpOnly,
                expiry:     cookieData.expiry
                    ? cookieData.expiry.toSeconds()
                    : undefined,
                sameSite:   cookieData.sameSite,
            });
        });
    }

    async deleteAllCookies(): Promise<void> {
        return await this.inContextOfThisPage(() => {
            return this.browser.deleteCookies() as Promise<void>;
        });
    }

    async title(): Promise<string> {
        return await this.inContextOfThisPage(() => this.browser.getTitle());
    }

    async name(): Promise<string> {
        return await this.inContextOfThisPage(() => this.browser.execute(`return window.name`));
    }

    async url(): Promise<URL> {
        return await this.inContextOfThisPage(async () => {
            return new URL(await this.browser.getUrl());
        });
    }

    async viewportSize(): Promise<{ width: number, height: number }> {
        return await this.inContextOfThisPage(async () => {
            if (! this.browser.isDevTools) {
                const calculatedViewportSize = await this.browser.execute(`
                    return {
                        width:  Math.max(document.documentElement.clientWidth,  window.innerWidth || 0),
                        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                    }
                `) as { width: number, height: number };

                // Chrome headless hard-codes window.innerWidth and window.innerHeight to 0
                if (calculatedViewportSize.width > 0 && calculatedViewportSize.height > 0) {
                    return calculatedViewportSize;
                }
            }

            return this.browser.getWindowSize();
        });
    }

    async setViewportSize(size: { width: number, height: number }): Promise<void> {
        return await this.inContextOfThisPage(async () => {
            let desiredWindowSize = size;

            if (! this.browser.isDevTools) {
                desiredWindowSize = await this.browser.execute(`
                    var currentViewportWidth  = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
                    var currentViewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                    
                    return {
                        width:  Math.max(window.outerWidth  - currentViewportWidth  + ${ size.width },  ${ size.width }),
                        height: Math.max(window.outerHeight - currentViewportHeight + ${ size.height }, ${ size.height }),
                    };
                `);
            }

            return this.browser.setWindowSize(desiredWindowSize.width, desiredWindowSize.height);
        });
    }

    async close(): Promise<void> {
        await this.inContextOfThisPage(() => this.browser.closeWindow());
    }

    async closeOthers(): Promise<void> {
        await this.session.closePagesOtherThan(this);
    }

    async isPresent(): Promise<boolean> {
        const allPages = await this.session.allPages();
        for (const page of allPages) {
            if (page === this) {
                return true;
            }
        }
        return false;
    }

    private async inContextOfThisPage<T>(action: () => Promise<T> | T): Promise<T> {
        let originalCurrentPage;

        try {
            originalCurrentPage = await this.session.currentPage();

            await this.session.changeCurrentPageTo(this);

            return await action();
        }
        catch (error) {
            return await this.errorHandler.executeIfHandled(error, action);
        }
        finally {
            await this.session.changeCurrentPageTo(originalCurrentPage);
        }
    }
}

/**
 * @package
 */
class LastScriptExecutionSummary<Result = any> {
    constructor(public readonly result: Result) {}
}
