import { List, LogicError, type QuestionAdapter } from '@serenity-js/core';
import { asyncMap } from '@serenity-js/core/lib/io';
import type { CorrelationId } from '@serenity-js/core/lib/model';
import type { Cookie, CookieData, PageElement, PageElements,Selector } from '@serenity-js/web';
import { ByDeepCss, Key, Page, PageElementsLocator } from '@serenity-js/web';
import type * as playwright from 'playwright-core';
import { URL } from 'url';

import type { PlaywrightOptions } from '../../PlaywrightOptions';
import { promised } from '../promised';
import { PlaywrightExistingElementLocator, PlaywrightLocator, PlaywrightRootLocator } from './locators';
import type { PlaywrightBrowsingSession } from './PlaywrightBrowsingSession';
import { PlaywrightModalDialogHandler } from './PlaywrightModalDialogHandler';
import { PlaywrightPageElement } from './PlaywrightPageElement';

/**
 * Playwright-specific implementation of {@apilink Page}.
 *
 * @group Models
 */
export class PlaywrightPage extends Page<playwright.Locator> {

    private lastScriptExecutionSummary: LastScriptExecutionSummary;

    static override current(): QuestionAdapter<PlaywrightPage> {
        return super.current() as QuestionAdapter<PlaywrightPage>;
    }

    constructor(
        session: PlaywrightBrowsingSession,
        private readonly page: playwright.Page,
        private readonly options: PlaywrightOptions,
        pageId: CorrelationId,
    ) {
        super(
            session,
            new PlaywrightRootLocator(page),
            new PlaywrightModalDialogHandler(page),
            pageId
        );
    }

    createPageElement(nativeElement: playwright.Locator): PageElement<playwright.Locator> {
        return new PlaywrightPageElement(
            new PlaywrightExistingElementLocator(
                this.rootLocator,
                new ByDeepCss((nativeElement as any)._selector),
                nativeElement,
            )
        );
    }

    locate(selector: Selector): PageElement<playwright.Locator> {
        return new PlaywrightPageElement(
            new PlaywrightLocator(
                this.rootLocator,
                selector,
            ),
        );
    }

    locateAll(selector: Selector): PageElements<playwright.Locator> {
        return List.of(
            new PageElementsLocator(
                new PlaywrightLocator(
                    this.rootLocator,
                    selector
                )
            )
        );
    }

    async navigateTo(destination: string): Promise<void> {
        await this.page.goto(destination, { waitUntil: this.options?.defaultNavigationWaitUntil });
        await this.resetState();
    }

    async navigateBack(): Promise<void> {
        await this.page.goBack({ waitUntil: this.options?.defaultNavigationWaitUntil });
        await this.resetState();
    }

    async navigateForward(): Promise<void> {
        await this.page.goForward({ waitUntil: this.options?.defaultNavigationWaitUntil });
        await this.resetState();
    }

    async reload(): Promise<void> {
        await this.page.reload({ waitUntil: this.options?.defaultNavigationWaitUntil });
        await this.resetState();
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

        const nativeArguments = await asyncMap(args, item =>
            item instanceof PlaywrightPageElement
                ? item.nativeElement().then(element => element.elementHandle())
                : item
        ) as InnerArguments;

        const serialisedScript = typeof script === 'function'
            ? String(script)
            : String(`function script() { ${ script } }`);

        const result = await this.page.evaluate<Result, typeof nativeArguments>(
            new Function(`
                const parameters = arguments[0];
                return (${ serialisedScript }).apply(null, parameters);
            `) as Parameters<typeof this.page.evaluate>[1],
            nativeArguments,
        );

        this.lastScriptExecutionSummary = new LastScriptExecutionSummary(
            result,
        );

        return result;
    }

    async executeAsyncScript<Result, InnerArguments extends any[]>(script: string | ((...args: [...parameters: InnerArguments, callback: (result: Result) => void]) => void), ...args: InnerArguments): Promise<Result> {

        const nativeArguments = await asyncMap(args, item =>
            item instanceof PlaywrightPageElement
                ? item.nativeElement().then(element => element.elementHandle())
                : item
        ) as InnerArguments;

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
            `) as Parameters<typeof this.page.evaluate>[1],
            nativeArguments
        );

        this.lastScriptExecutionSummary = new LastScriptExecutionSummary(
            result,
        );

        return result;
    }

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
            url:        !(cookieData.domain && cookieData.path)     // eslint-disable-line unicorn/no-negated-condition
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

    async title(): Promise<string> {
        const currentFrame = await this.currentFrame();
        return currentFrame.title();
    }

    async name(): Promise<string> {
        const currentFrame = await this.currentFrame();
        return currentFrame.evaluate(
            () => window.name
        );
    }

    async url(): Promise<URL> {
        const currentFrame = await this.currentFrame();
        return new URL(currentFrame.url());
    }

    async viewportSize(): Promise<{ width: number, height: number }> {
        return this.page.viewportSize();
    }

    async setViewportSize(size: { width: number, height: number }): Promise<void> {
        await this.page.setViewportSize(size);
    }

    async close(): Promise<void> {
        await this.resetState();
        await (this.modalDialogHandler as PlaywrightModalDialogHandler).discard();
        await this.page.close();
    }

    async closeOthers(): Promise<void> {
        await this.session.closePagesOtherThan(this);
    }

    isPresent(): Promise<boolean> {
        return promised(! this.page.isClosed());
    }

    async nativePage(): Promise<playwright.Page> {
        return promised(this.page);
    }

    private async resetState() {
        this.lastScriptExecutionSummary = undefined;
        await this.rootLocator.switchToMainFrame()
        await this.modalDialogHandler.reset();
    }

    private async currentFrame(): Promise<playwright.Frame> {
        return await this.rootLocator.nativeElement() as unknown as playwright.Frame;
    }
}

/**
 * @package
 */
class LastScriptExecutionSummary<Result = any> {
    constructor(public readonly result: Result) {}
}
