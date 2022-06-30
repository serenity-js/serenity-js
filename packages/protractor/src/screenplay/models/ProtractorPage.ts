import { LogicError } from '@serenity-js/core';
import { CorrelationId } from '@serenity-js/core/lib/model';
import { BrowserWindowClosedError, Cookie, CookieData, Key, ModalDialogObstructsScreenshotError, Page, PageElement, PageElements, Selector } from '@serenity-js/web';
import { ElementFinder, ProtractorBrowser } from 'protractor';
import { URL } from 'url';

import { promised } from '../promised';
import { ProtractorLocator, ProtractorNativeElementRoot } from './locators';
import { ProtractorBrowsingSession } from './ProtractorBrowsingSession';
import { ProtractorCookie } from './ProtractorCookie';
import { ProtractorPageElement } from './ProtractorPageElement';

/**
 * @desc
 *  Protractor-specific implementation of the {@link @serenity-js/web/lib/screenplay/models~Page}.
 *
 * @see {@link @serenity-js/web/lib/screenplay/models~Page}
 */
export class ProtractorPage extends Page {

    /**
     * @private
     */
    private lastScriptExecutionSummary: LastScriptExecutionSummary;

    constructor(
        session: ProtractorBrowsingSession,
        private readonly browser: ProtractorBrowser,
        id: CorrelationId
    ) {
        super(session, id);
    }

    locate(selector: Selector): PageElement<ElementFinder> {
        const parentRoot: ProtractorNativeElementRoot = {
            element: this.browser.element.bind(this.browser),
            all: this.browser.element.all.bind(this.browser),
        }

        return new ProtractorPageElement(
            new ProtractorLocator(() => parentRoot, selector)
        )
    }

    locateAll(selector: Selector): PageElements<ElementFinder> {
        const parentRoot: ProtractorNativeElementRoot = {
            element: this.browser.element.bind(this.browser),
            all: this.browser.element.all.bind(this.browser),
        }

        return new PageElements(
            new ProtractorLocator(() => parentRoot, selector)
        );
    }

    /**
     * @desc
     * If set to false, Protractor will not wait for Angular $http and $timeout
     * tasks to complete before interacting with the browser.
     *
     * This can be useful when:
     * - you need to switch to a non-Angular app during your tests (i.e. SSO login gateway)
     * - your app continuously polls an API with $timeout
     *
     * If you're not testing an Angular app, it's better to disable Angular synchronisation completely
     * in protractor configuration:
     *
     * @example <caption>protractor.conf.js</caption>
     * exports.config = {
     *     onPrepare: function () {
     *         return browser.waitForAngularEnabled(false);
     *     },
     *
     *     // ... other config
     * };
     *
     * @param {boolean} enable
     *
     * @returns {Promise<boolean>}
     */
    enableAngularSynchronisation(enable: boolean): Promise<boolean> {
        return this.switchToAndPerform(() => {
            return promised(this.browser.waitForAngularEnabled(enable));
        });
    }

    navigateTo(destination: string): Promise<void> {
        return this.switchToAndPerform(() => {
            return promised(this.browser.get(destination));
        });
    }

    navigateBack(): Promise<void> {
        return this.switchToAndPerform(() => {
            return promised(this.browser.navigate().back());
        });
    }

    navigateForward(): Promise<void> {
        return this.switchToAndPerform(() => {
            return promised(this.browser.navigate().forward());
        });
    }

    reload(): Promise<void> {
        return this.switchToAndPerform(() => {
            return promised(this.browser.navigate().refresh());
        });
    }

    async sendKeys(keys: (string | Key)[]): Promise<void> {
        function isModifier(maybeKey: string | Key): boolean {
            return Key.isKey(maybeKey) && maybeKey.isModifier;
        }

        function asCodePoint(maybeKey: string | Key): string {
            if (! Key.isKey(maybeKey)) {
                return maybeKey;
            }

            return maybeKey.utf16codePoint;
        }

        return this.switchToAndPerform(() => {
            // keyDown for any modifier keys and sendKeys otherwise
            const keyDownActions = keys.reduce((actions, key) => {
                return isModifier(key)
                    ? actions.keyDown(asCodePoint(key))
                    : actions.sendKeys(asCodePoint(key))
            }, this.browser.actions());

            // keyUp for any modifier keys, ignore for regular keys
            const keyUpActions = keys.reduce((actions, key) => {
                return isModifier(key)
                    ? actions.keyUp(asCodePoint(key))
                    : actions;
            }, keyDownActions);

            return promised(keyUpActions.perform());
        });
    }

    async executeScript<Result, InnerArguments extends any[]>(
        script: string | ((...parameters: InnerArguments) => Result),
        ...args: InnerArguments
    ): Promise<Result> {
        const innerArguments = [] as InnerArguments;
        for (const arg of args) {
            const innerArgument = arg instanceof ProtractorPageElement
                ? await arg.nativeElement()
                : arg;

            innerArguments.push(innerArgument);
        }

        const result = await this.switchToAndPerform<Result>(() => {
            return promised(this.browser.executeScript(script, ...innerArguments));
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
            const parameter = arg instanceof ProtractorPageElement
                ? await arg.nativeElement()
                : arg;

            parameters.push(parameter);
        }

        const result = await this.switchToAndPerform<Result>(() => {
            return promised(this.browser.executeAsyncScript(script, ...parameters));
        });

        this.lastScriptExecutionSummary = new LastScriptExecutionSummary(result);

        return result;
    }

    lastScriptExecutionResult(): any {
        if (! this.lastScriptExecutionSummary) {
            throw new LogicError(`Make sure to execute a script before checking on the result`);
        }

        // Selenium 3 returns `null` when the script it executed returns `undefined`
        // so we're mapping the result back.
        return this.lastScriptExecutionSummary.result !== null
            ? this.lastScriptExecutionSummary.result
            : undefined;
    }

    takeScreenshot(): Promise<string> {
        return this.switchToAndPerform(async () => {
            try {
                return await promised(this.browser.takeScreenshot());
            }
            catch (error) {

                if (error.name && error.name === 'NoSuchSessionError') {
                    throw new BrowserWindowClosedError(
                        'Browser window is not available to take a screenshot',
                        error,
                    );
                }

                if (error.name && error.name === 'UnexpectedAlertOpenError') {
                    throw new ModalDialogObstructsScreenshotError(
                        'A JavaScript dialog is open, which prevents taking a screenshot. Please use ModalDialog to dismiss it, or change your unhandledPromptBehavior configuration to do it automatically.',
                        error,
                    );
                }

                throw error;
            }
        });
    }

    async cookie(name: string): Promise<Cookie> {
        return new ProtractorCookie(this.browser, name);
    }

    async setCookie(cookieData: CookieData): Promise<void> {
        return this.switchToAndPerform(() => {
            return promised(this.browser.manage().addCookie({
                name:       cookieData.name,
                value:      cookieData.value,
                path:       cookieData.path,
                domain:     cookieData.domain,
                secure:     cookieData.secure,
                httpOnly:   cookieData.httpOnly,
                expiry:     cookieData.expiry
                    ? cookieData.expiry.toSeconds()
                    : undefined,
            }));
        });
    }

    deleteAllCookies(): Promise<void> {
        return this.switchToAndPerform(() => {
            return promised(this.browser.manage().deleteAllCookies());
        });
    }

    title(): Promise<string> {
        return this.switchToAndPerform(() => {
            return promised(this.browser.getTitle());
        });
    }

    name(): Promise<string> {
        return this.switchToAndPerform(() => {
            return promised(this.browser.executeScript('return window.name'));
        });
    }

    url(): Promise<URL> {
        return this.switchToAndPerform(async () => {
            return new URL(await promised(this.browser.getCurrentUrl()));
        });
    }

    async viewportSize(): Promise<{ width: number, height: number }> {
        return this.switchToAndPerform(async () => {
            const calculatedViewportSize = await promised(this.browser.executeScript(
                `return {
                    width:  Math.max(document.documentElement.clientWidth,  window.innerWidth || 0),
                    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                };`
            )) as { width: number, height: number };

            if (calculatedViewportSize.width > 0 && calculatedViewportSize.height > 0) {
                return calculatedViewportSize;
            }

            // Chrome headless hard-codes window.innerWidth and window.innerHeight to 0
            return promised(this.browser.manage().window().getSize());
        });
    }

    async setViewportSize(size: { width: number, height: number }): Promise<void> {
        return this.switchToAndPerform(async () => {
            const desiredWindowSize: { width: number, height: number } = await promised(this.browser.executeScript(`
                var currentViewportWidth  = Math.max(document.documentElement.clientWidth,  window.innerWidth || 0)
                var currentViewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                
                return {
                    width:  Math.max(window.outerWidth  - currentViewportWidth  + ${ size.width },  ${ size.width }),
                    height: Math.max(window.outerHeight - currentViewportHeight + ${ size.height }, ${ size.height }),
                };
            `));

            return promised(this.browser.manage().window().setSize(desiredWindowSize.width, desiredWindowSize.height));
        });
    }

    async close(): Promise<void> {
        try {
            await this.switchToAndPerform(async () => promised(this.browser.close()));
        } catch (error) {
            if (error.name !== 'NoSuchWindowError') {
                throw error
            }
        }
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

    private async switchToAndPerform<T>(action: () => Promise<T> | T): Promise<T> {
        const originalPage = await this.session.currentPage();

        await this.session.changeCurrentPageTo(this);

        const result = await action();

        await this.session.changeCurrentPageTo(originalPage);

        return result;
    }
}

/**
 * @package
 */
class LastScriptExecutionSummary {
    constructor(public readonly result: any) {}
}
