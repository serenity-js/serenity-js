import { CorrelationId } from '@serenity-js/core/lib/model';

import { Page } from './Page';

/**
 * @desc
 *  Represents the pages open in the current browsing context.
 *
 *  You'll need to use this class only if you're planning to integrate Serenity/JS
 *  with a new Web integration tool.
 *
 * @abstract
 */
export abstract class PagesContext<Page_Type extends Page> {
    protected currentBrowserPage: Page_Type;
    protected readonly pages: Map<CorrelationId, Page_Type> = new Map<CorrelationId, Page_Type>();

    async closePagesOtherThan(pageOfInterest: Page_Type): Promise<void> {
        for (const [pageId, page] of this.pages) {
            if (page !== pageOfInterest) {
                await page.close();
                this.pages.delete(pageId);
            }
        }

        await this.changeCurrentPageTo(pageOfInterest);
    }

    /**
     * @desc
     *  Opens a new browser page and associates it with a {@link Page} object.
     *
     * @returns {Promise<Page>}
     */
    protected abstract registerCurrentPage(): Promise<Page_Type>;

    /**
     * @desc
     *  Returns a {@link Page} representing the currently active top-level browsing context.
     *
     * @returns {Promise<Page>}
     */
    async currentPage(): Promise<Page_Type> {
        if (! this.currentBrowserPage || ! await this.currentBrowserPage.isPresent()) {
            this.currentBrowserPage = await this.registerCurrentPage();
        }

        return this.currentBrowserPage;
    }

    /**
     * @desc
     *  Registers given {@link Page}s to be managed by this {@link PagesContext}.
     *
     * @param {...Page[]} pages
     * @returns {void}
     */
    register(...pages: Page_Type[]): void {
        for(const page of pages) {
            this.pages.set(page.id, page);
        }
    }

    /**
     * @desc
     *  Informs this {@link PagesContext} that it should no longer manage {@link Page}s
     *  identified by the given `pageIds`.
     *
     * @param {...CorrelationId[]} pageIds
     * @returns {void}
     */
    deregister(...pageIds: CorrelationId[]): void {
        for(const pageId of pageIds) {
            this.pages.delete(pageId);
        }
    }

    /**
     * @desc
     *  Returns an array of {@link Page} objects representing all the available
     *  top-level browsing context, e.g. all the open browser tabs.
     *
     * @returns {Promise<Array<Page>>}
     */
    async allPages(): Promise<Array<Page_Type>> {
        return Array.from(this.pages.values()) as Page_Type[];
    }

    /**
     * @desc
     *  Returns the ids of any {@link Page}s this {@link PagesContext} is aware of.
     *
     * @returns {Array<CorrelationId>}
     */
    registeredPageIds(): Array<CorrelationId> {
        return Array.from(this.pages.keys());
    }

    /**
     * @desc
     *  Informs the {@link PagesContext} that the "current page" has changed to `page`.
     *
     *  Please note that different Web integration tools have a different definition of what a "current page" is.
     *  For example, Selenium or WebdriverIO use a single "focused" window that a developer
     *  needs to explicitly "switch to" in their tests in order to interact with it.
     *  This is similar to how a regular user would interact with Web pages;
     *  switching from one tab to another, but not interacting with more than one
     *  window/tab simultaneously.
     *
     *  Playwright and Puppeteer, on the other hand, don't have a concept of the "current" page at all, since they
     *  allow the developer to interact with multiple open tabs/windows at the same time.
     *
     *  Web integration-specific implementations of this class should override this method to define
     *  how the concept of the "current page" should be interpreted by Serenity/JS.
     *
     * @param {Page} page
     * @returns {void}
     */
    async changeCurrentPageTo(page: Page_Type): Promise<void> {
        this.currentBrowserPage = page;
    }

    /**
     * @desc
     *  Closes all the pages available in this browsing context
     *
     * @returns {Promise<void>}
     */
    async closeAllPages(): Promise<void> {
        for (const page of this.pages.values()) {
            await page.close();
        }

        this.pages.clear();
        this.currentBrowserPage = undefined;
    }
}
