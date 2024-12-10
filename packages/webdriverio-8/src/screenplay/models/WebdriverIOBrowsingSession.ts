import 'webdriverio';

import { LogicError } from '@serenity-js/core';
import { CorrelationId } from '@serenity-js/core/lib/model/index.js';
import type { BrowserCapabilities, ModalDialogHandler } from '@serenity-js/web';
import { BrowsingSession } from '@serenity-js/web';
import type { Page } from 'puppeteer-core';

import { WebdriverIOPage } from '../models/index.js';
import { WebdriverIOErrorHandler } from './WebdriverIOErrorHandler.js';
import { WebdriverIOModalDialogHandler } from './WebdriverIOModalDialogHandler.js';
import { WebdriverIOPuppeteerModalDialogHandler } from './WebdriverIOPuppeteerModalDialogHandler.js';

/**
 * WebdriverIO-specific implementation of [`BrowsingSession`](https://serenity-js.org/api/web/class/BrowsingSession/).
 *
 * @group Models
 */
export class WebdriverIOBrowsingSession extends BrowsingSession<WebdriverIOPage> {

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
            const errorHandler = new WebdriverIOErrorHandler();
            this.register(
                new WebdriverIOPage(
                    this,
                    this.browser,
                    await this.modalDialogHandlerFor(newlyOpenedWindowHandle, errorHandler),
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
        const windowHandle = await this.browser.getWindowHandle();

        const errorHandler = new WebdriverIOErrorHandler();

        const page = new WebdriverIOPage(
            this,
            this.browser,
            await this.modalDialogHandlerFor(windowHandle, errorHandler),
            errorHandler,
            new CorrelationId(windowHandle)
        );

        this.register(page)

        return page;
    }

    private async modalDialogHandlerFor(windowHandle: string, errorHandler: WebdriverIOErrorHandler): Promise<ModalDialogHandler> {
        return this.browser.isDevTools
            ? new WebdriverIOPuppeteerModalDialogHandler(await this.puppeteerPageFor(windowHandle))
            : new WebdriverIOModalDialogHandler(this.browser, errorHandler);
    }

    private async puppeteerPageFor(windowHandle: string): Promise<Page>  {
        const puppeteer = await this.browser.getPuppeteer();
        const pages = await puppeteer.pages();

        const handles = await this.browser.getWindowHandles();

        if (handles.length !== pages.length) {
            throw new LogicError(`The number of registered Puppeteer pages doesn't match WebdriverIO window handles`)
        }

        const index = handles.indexOf(windowHandle);

        // We cast to `unknown` first because the version of Page in Puppeteer-core
        // might be slightly out-of-sync with what the WebdriverIO uses.
        // This doesn't really matter since we're only using it to work with Dialogs.
        const page = pages[index] as unknown as Page;

        if (! page) {
            throw new LogicError(`Couldn't find Puppeteer page for WebdriverIO window handle ${ windowHandle }`)
        }

        return page;
    }

    override browserCapabilities(): Promise<BrowserCapabilities> {
        return Promise.resolve(this.browser.capabilities as BrowserCapabilities);
    }
}
