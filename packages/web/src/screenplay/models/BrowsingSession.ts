import type { CorrelationId } from '@serenity-js/core/lib/model';

import type { BrowserCapabilities } from './BrowserCapabilities';
import type { Page } from './Page';

/**
 * Represents the pages open in the current browsing context.
 *
 * You'll need to use this class directly only if you're planning to integrate Serenity/JS
 * with a new Web integration tool.
 *
 * @group Models
 */
export abstract class BrowsingSession<Page_Type extends Page> {
    protected currentBrowserPage: Page_Type;
    protected readonly pages: Map<CorrelationId, Page_Type> = new Map<CorrelationId, Page_Type>();

    async closePagesOtherThan(pageOfInterest: Page_Type): Promise<void> {
        for (const page of await this.allPages()) {
            if (! page.id.equals(pageOfInterest.id)) {
                await page.close();
                this.pages.delete(page.id);
            }
        }

        await this.changeCurrentPageTo(pageOfInterest);
    }

    /**
     * Opens a new browser page and associates it with a [`Page`](https://serenity-js.org/api/web/class/Page/) object.
     */
    protected abstract registerCurrentPage(): Promise<Page_Type>;

    /**
     * Returns [basic meta-data](https://serenity-js.org/api/web/interface/BrowserCapabilities/) about the browser associated with this browsing session.
     */
    public abstract browserCapabilities(): Promise<BrowserCapabilities>;

    /**
     * Returns a [`Page`](https://serenity-js.org/api/web/class/Page/) representing the currently active top-level browsing context.
     */
    async currentPage(): Promise<Page_Type> {
        if (! this.currentBrowserPage || ! await this.currentBrowserPage.isPresent()) {
            this.currentBrowserPage = await this.registerCurrentPage();
        }

        return this.currentBrowserPage;
    }

    /**
     * Registers specified [pages](https://serenity-js.org/api/web/class/Page/) to be managed by this [`BrowsingSession`](https://serenity-js.org/api/web/class/BrowsingSession/).
     *
     * @param pages
     */
    register(...pages: Page_Type[]): void {
        for(const page of pages) {
            this.pages.set(page.id, page);
        }
    }

    /**
     * Informs this [`BrowsingSession`](https://serenity-js.org/api/web/class/BrowsingSession/) that it should no longer manage [pages](https://serenity-js.org/api/web/class/Page/)
     * identified by the given `pageIds`.
     *
     * @param pageIds
     */
    deregister(...pageIds: CorrelationId[]): void {
        for(const pageId of pageIds) {
            this.pages.delete(pageId);
        }
    }

    /**
     * Returns a [pages](https://serenity-js.org/api/web/class/Page/) representing all the available
     * top-level browsing context, e.g. all the open browser tabs.
     */
    async allPages(): Promise<Array<Page_Type>> {
        return Array.from(this.pages.values()) as Page_Type[];
    }

    /**
     * Returns the ids of any [pages](https://serenity-js.org/api/web/class/Page/) this [`BrowsingSession`](https://serenity-js.org/api/web/class/BrowsingSession/) is aware of.
     */
    registeredPageIds(): Array<CorrelationId> {
        return Array.from(this.pages.keys());
    }

    /**
     * Informs the [`BrowsingSession`](https://serenity-js.org/api/web/class/BrowsingSession/) that the "current page" has changed to `page`.
     *
     * Please note that different Web integration tools have a different definition of what a "current page" is.
     * For example, Selenium or WebdriverIO use a single "focused" window that a developer
     * needs to explicitly "switch to" in their tests in order to interact with it.
     * This is similar to how a regular user would interact with Web pages;
     * switching from one tab to another, but not interacting with more than one
     * window/tab simultaneously.
     *
     * Playwright and Puppeteer, on the other hand, don't have a concept of the "current" page at all, since they
     * allow the developer to interact with multiple open tabs/windows at the same time.
     *
     * Web integration-specific implementations of this class should override this method to define
     * how the concept of the "current page" should be interpreted by Serenity/JS.
     *
     * @param page
     */
    async changeCurrentPageTo(page: Page_Type): Promise<void> {
        this.currentBrowserPage = page;
    }

    /**
     * Closes all the pages available in this browsing context
     */
    async closeAllPages(): Promise<void> {
        for (const page of this.pages.values()) {
            await page.close();
        }

        this.pages.clear();
        this.currentBrowserPage = undefined;
    }
}
