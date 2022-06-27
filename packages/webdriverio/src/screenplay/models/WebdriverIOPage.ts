import { LogicError } from '@serenity-js/core';
import { CorrelationId } from '@serenity-js/core/lib/model';
import { Cookie, CookieData, Key, Page, PageElement, PageElements, Selector } from '@serenity-js/web';
import { URL } from 'url';
import * as wdio from 'webdriverio';

import { WebdriverIOLocator } from './locators';
import { WebdriverIOCookie } from './WebdriverIOCookie';
import { WebdriverIOPageElement } from './WebdriverIOPageElement';
import { WebdriverIOPagesContext } from './WebdriverIOPagesContext';

/**
 * @desc
 *  WebdriverIO-specific implementation of the {@link @serenity-js/web/lib/screenplay/models~Page}.
 *
 * @see {@link @serenity-js/web/lib/screenplay/models~Page}
 */
export class WebdriverIOPage extends Page {

    /**
     * @private
     */
    private lastScriptExecutionSummary: LastScriptExecutionSummary;

    constructor(
        context: WebdriverIOPagesContext,
        private readonly browser: wdio.Browser<'async'>,
        id: CorrelationId,
    ) {
        super(context, id);
    }

    locate(selector: Selector): PageElement<wdio.Element<'async'>> {
        return new WebdriverIOPageElement(
            new WebdriverIOLocator(() => this.browser, selector)
        )
    }

    locateAll(selector: Selector): PageElements<wdio.Element<'async'>> {
        return new PageElements(
            new WebdriverIOLocator(() => this.browser, selector)
        );
    }

    navigateTo(destination: string): Promise<void> {
        return this.switchToAndPerform(async () => {
            await this.browser.url(destination);
        });
    }

    navigateBack(): Promise<void> {
        return this.switchToAndPerform(() => this.browser.back());
    }

    navigateForward(): Promise<void> {
        return this.switchToAndPerform(() => this.browser.forward());
    }

    reload(): Promise<void> {
        return this.switchToAndPerform(() => this.browser.refresh());
    }

    sendKeys(keys: Array<Key | string>): Promise<void> {
        const keySequence = keys.map(key => {
            if (! Key.isKey(key)) {
                return key;
            }

            if (this.browser.isDevTools) {
                return key.devtoolsName;
            }

            return key.utf16codePoint;
        });

        return this.switchToAndPerform(() => this.browser.keys(keySequence));
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

        const result = await this.switchToAndPerform<Result>(() => {
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

        const result = await this.switchToAndPerform<Result>(() => {
            return this.browser.executeAsync<Result, Parameters>(script, ...parameters);
        });

        this.lastScriptExecutionSummary = new LastScriptExecutionSummary(result);

        return result;
    }

    /**
     * @desc
     *  Returns the last result of calling {@link BrowseTheWebWithWebdriverIO#executeAsyncScript}
     *  or {@link BrowseTheWebWithWebdriverIO#executeScript}
     *
     * @returns {any}
     */
    lastScriptExecutionResult<Result = any>(): Result {
        if (! this.lastScriptExecutionSummary) {
            throw new LogicError(`Make sure to execute a script before checking on the result`);
        }

        // Selenium returns `null` when the script it executed returns `undefined`
        // so we're mapping the result back.
        return this.lastScriptExecutionSummary.result !== null
            ? this.lastScriptExecutionSummary.result
            : undefined;
    }

    takeScreenshot(): Promise<string> {
        return this.browser.takeScreenshot();
    }

    async cookie(name: string): Promise<Cookie> {
        return new WebdriverIOCookie(this.browser, name);
    }

    async setCookie(cookieData: CookieData): Promise<void> {
        return this.switchToAndPerform(() => {
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

    deleteAllCookies(): Promise<void> {
        return this.switchToAndPerform(() => {
            return this.browser.deleteCookies() as Promise<void>;
        });
    }

    title(): Promise<string> {
        return this.switchToAndPerform(() => {
            return this.browser.getTitle();
        });
    }

    name(): Promise<string> {
        return this.switchToAndPerform(() => {
            return this.browser.execute(`return window.name`);
        });
    }

    async url(): Promise<URL> {
        return this.switchToAndPerform(async () => {
            return new URL(await browser.getUrl());
        });
    }

    async viewportSize(): Promise<{ width: number, height: number }> {
        return this.switchToAndPerform(async () => {
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

    setViewportSize(size: { width: number, height: number }): Promise<void> {
        return this.switchToAndPerform(async () => {
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
        await this.switchToAndPerform(async () => this.browser.closeWindow());
    }

    async closeOthers(): Promise<void> {
        await this.context.closePagesOtherThan(this);
    }

    async isPresent(): Promise<boolean> {
        const allPages = await this.context.allPages();
        for (const page of allPages) {
            if (page === this) {
                return true;
            }
        }
        return false;
    }

    private async switchToAndPerform<T>(action: () => Promise<T> | T): Promise<T> {
        const originalPage = await this.context.currentPage();

        await this.context.changeCurrentPageTo(this);

        const result = await action();

        await this.context.changeCurrentPageTo(originalPage);

        return result;
    }
}

/**
 * @package
 */
class LastScriptExecutionSummary<Result = any> {
    constructor(public readonly result: Result) {}
}
