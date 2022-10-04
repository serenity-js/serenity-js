import { CorrelationId } from '@serenity-js/core/lib/model';
import { BrowsingSession } from '@serenity-js/web';
import * as protractor from 'protractor';

import { ProtractorPage } from '../models';
import { promised } from '../promised';
import { ProtractorErrorHandler } from './ProtractorErrorHandler';
import { ProtractorModalDialogHandler } from './ProtractorModalDialogHandler';

/**
 * Protractor-specific implementation of {@apilink BrowsingSession}.
 *
 * @group Models
 */
export class ProtractorBrowsingSession extends BrowsingSession<ProtractorPage> {

    constructor(protected readonly browser: protractor.ProtractorBrowser) {
        super();
    }

    async allPages(): Promise<Array<ProtractorPage>> {
        // scan all the active window handles and add any newly opened windows if needed
        const windowHandles: string[] = await promised(this.browser.getAllWindowHandles());

        // remove pages that are no longer open
        const closedPageIds = this.registeredPageIds()
            .filter(id => ! windowHandles.includes(id.value));

        this.deregister(...closedPageIds);

        // add any new pages that might have been opened (e.g. popup windows)
        const registeredWindowHandles   = new Set(this.registeredPageIds().map(id => id.value));
        const newlyOpenedWindowHandles  = windowHandles.filter(windowHandle => ! registeredWindowHandles.has(windowHandle));

        for (const newlyOpenedWindowHandle of newlyOpenedWindowHandles) {
            const errorHandler = new ProtractorErrorHandler();
            this.register(
                new ProtractorPage(
                    this,
                    this.browser,
                    new ProtractorModalDialogHandler(this.browser, errorHandler),
                    errorHandler,
                    new CorrelationId(newlyOpenedWindowHandle))
            );
        }

        return super.allPages();
    }

    /**
     * @override
     * @param page
     */
    async changeCurrentPageTo(page: ProtractorPage): Promise<void> {
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
        await promised(this.browser.switchTo().window(page.id.value));

        // and update the cached reference
        await super.changeCurrentPageTo(page);
    }

    private async activeWindowHandle(): Promise<string> {
        try {
            return await promised(this.browser.getWindowHandle());
        }
        catch (error) {
            // If the window is closed by user action Protractor will still hold the reference to the closed window.
            if (['NoSuchWindowError', 'no such window'].includes(error.name)) {
                const allHandles = await promised(this.browser.getAllWindowHandles());
                if (allHandles.length > 0) {
                    const handle = allHandles[allHandles.length - 1];
                    await promised(this.browser.switchTo().window(handle));

                    return handle;
                }
            }
            throw error;
        }
    }

    override async currentPage(): Promise<ProtractorPage> {
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

    protected async registerCurrentPage(): Promise<ProtractorPage> {
        const windowHandle = await this.browser.getWindowHandle();

        const errorHandler = new ProtractorErrorHandler();

        const page = new ProtractorPage(
            this,
            this.browser,
            new ProtractorModalDialogHandler(this.browser, errorHandler),
            errorHandler,
            new CorrelationId(windowHandle)
        );

        this.register(page)

        return page;
    }
}
