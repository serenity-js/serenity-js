import type { BrowserCapabilities } from '@serenity-js/web';
import type * as playwright from 'playwright-core';

import type { PlaywrightOptions } from '../../PlaywrightOptions';
import { PlaywrightBrowsingSession } from './PlaywrightBrowsingSession';
import type { PlaywrightPage } from './PlaywrightPage';

/**
 *  @group Models
 */
export class PlaywrightBrowsingSessionWithBrowser extends PlaywrightBrowsingSession {

    constructor(
        protected readonly browser: playwright.Browser,
        browserContextOptions: PlaywrightOptions,
        selectors: playwright.Selectors,
    ) {
        super(browserContextOptions, selectors);
    }

    protected override async createBrowserContext(options: PlaywrightOptions): Promise<playwright.BrowserContext> {
        return this.browser.newContext(this.browserContextOptions);
    }

    protected override async registerCurrentPage(): Promise<PlaywrightPage> {
        const context = await this.browserContext();

        await context.newPage();

        // calling context.newPage() triggers a callback registered via browserContext(),
        // which wraps playwright.Page in PlaywrightPage and adds it to the list of pages
        // returned by this.allPages()

        const allPages = await this.allPages()

        return allPages.at(-1);
    }

    override async closeAllPages(): Promise<void> {
        await super.closeAllPages();

        const context = await this.browserContext();
        await context.close();
    }

    override async browserCapabilities(): Promise<BrowserCapabilities> {
        return {
            browserName: (this.browser as any)._initializer.name,   // todo: raise a PR to Playwright to expose this information
            platformName: process.platform,                         // todo: get the actual platform from Playwright
            browserVersion: this.browser.version()
        }
    }
}
