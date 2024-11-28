import 'webdriverio';

import { type Discardable, LogicError } from '@serenity-js/core';
import { CorrelationId } from '@serenity-js/core/lib/model/index.js';
import type { BrowserCapabilities } from '@serenity-js/web';
import { BrowsingSession } from '@serenity-js/web';

import { WebdriverIOPage } from '../models/index.js';
import { WebdriverIOErrorHandler } from './WebdriverIOErrorHandler.js';
import { WebdriverIOModalDialogHandler } from './WebdriverIOModalDialogHandler.js';
import { WebdriverProtocolErrorCode } from './WebdriverProtocolErrorCode.js';

/**
 * WebdriverIO-specific implementation of [`BrowsingSession`](https://serenity-js.org/api/web/class/BrowsingSession/).
 *
 * @group Models
 */
export class WebdriverIOBrowsingSession extends BrowsingSession<WebdriverIOPage> implements Discardable {

    constructor(protected readonly browser: WebdriverIO.Browser) {
        super();

        if (! browser.$ || ! browser.$$) {
            throw new LogicError(`WebdriverIO browser object is not initialised yet, so can't be assigned to an actor. Are you trying to instantiate an actor outside of a test or a test hook?`)
        }
    }

    override async allPages(): Promise<Array<WebdriverIOPage>> {
        // scan all the active window handles and add any newly opened windows if needed
        const windowHandles: string[] = await this.browser.getWindowHandles();

        // remove pages that are no longer open
        const closedPageIds = this.registeredPageIds()
            .filter(id => ! windowHandles.includes(id.value));

        this.deregister(...closedPageIds);

        // add any new pages that might have been opened (e.g. popup windows)
        const registeredWindowHandles   = new Set(this.registeredPageIds().map(id => id.value));
        const newlyOpenedWindowHandles  = windowHandles.filter(windowHandle => ! registeredWindowHandles.has(windowHandle));

        for (const newlyOpenedWindowHandle of newlyOpenedWindowHandles) {
            const modalDialogHandler = new WebdriverIOModalDialogHandler(this.browser);
            const errorHandler = new WebdriverIOErrorHandler();
            errorHandler.setHandlerFor(WebdriverProtocolErrorCode.UnexpectedAlertOpenError, error => modalDialogHandler.dismiss());

            this.register(
                new WebdriverIOPage(
                    this,
                    this.browser,
                    modalDialogHandler,
                    errorHandler,
                    new CorrelationId(newlyOpenedWindowHandle)
                )
            );
        }

        return super.allPages();
    }

    /**
     * @param page
     */
    override async changeCurrentPageTo(page: WebdriverIOPage): Promise<void> {
        const currentPage = await this.currentPage();

        // are we already on this page?
        if (currentPage.id.equals(page.id)) {
            return void 0;
        }

        // does the new page exist, or has it been closed in the meantime by user action, script, or similar?
        if (! await page.isPresent()) {
            return void 0;
        }

        // the page seems to be legit, switch to it
        await this.browser.switchToWindow(page.id.value);

        // and update the cached reference
        await super.changeCurrentPageTo(page);
    }

    private async activeWindowHandle(): Promise<string> {
        try {
            return await this.browser.getWindowHandle();
        }
        catch (error) {
            // If the window is closed by user action Webdriver will still hold the reference to the closed window.
            if (['NoSuchWindowError', 'no such window'].includes(error.name)) {
                const allHandles = await this.browser.getWindowHandles();
                if (allHandles.length > 0) {
                    const handle = allHandles.at(-1);
                    await this.browser.switchToWindow(handle);

                    return handle;
                }
            }
            throw error;
        }
    }

    override async currentPage(): Promise<WebdriverIOPage> {
        const actualCurrentPageHandle   = await this.activeWindowHandle();
        const actualCurrentPageId       = CorrelationId.fromJSON(actualCurrentPageHandle);

        if (this.currentBrowserPage && this.currentBrowserPage.id.equals(actualCurrentPageId)) {
            return this.currentBrowserPage;
        }

        // Looks like the actual current page is not what we thought the current page was.
        // Is it one of the pages we are aware of?

        const allPages = await this.allPages();
        const found = allPages.find(page => page.id.equals(actualCurrentPageId));
        if (found) {
            this.currentBrowserPage = found;
            return this.currentBrowserPage;
        }

        // OK, so that's a handle that we haven't seen before, let's register it and set as current page.
        this.currentBrowserPage = await this.registerCurrentPage();

        return this.currentBrowserPage;
    }

    protected override async registerCurrentPage(): Promise<WebdriverIOPage> {
        const pageId = await this.assignPageId();

        const modalDialogHandler = new WebdriverIOModalDialogHandler(this.browser);
        const errorHandler = new WebdriverIOErrorHandler();
        errorHandler.setHandlerFor(WebdriverProtocolErrorCode.UnexpectedAlertOpenError, error => modalDialogHandler.dismiss());

        const page = new WebdriverIOPage(
            this,
            this.browser,
            modalDialogHandler,
            errorHandler,
            pageId,
        );

        this.register(page)

        return page;
    }

    private async assignPageId(): Promise<CorrelationId> {
        if (this.browser.isMobile) {
            const context = await this.browser.getContext();

            if (typeof context === 'string') {
                return new CorrelationId(context);
            }

            if (context.id) {
                return new CorrelationId(context.id);
            }
        }

        if (this.browser['getWindowHandle']) {
            const handle = await this.browser.getWindowHandle();

            return new CorrelationId(handle);
        }

        return CorrelationId.create();
    }

    override browserCapabilities(): Promise<BrowserCapabilities> {
        return Promise.resolve(this.browser.capabilities as BrowserCapabilities);
    }

    async discard(): Promise<void> {
        for (const page of await this.allPages()) {
            await (page as WebdriverIOPage).discard();
        }
    }
}
