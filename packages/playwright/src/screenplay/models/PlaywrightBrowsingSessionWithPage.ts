import { CorrelationId } from '@serenity-js/core/lib/model';
import type { BrowserCapabilities } from '@serenity-js/web';
import type * as playwright from 'playwright-core';

import type { PlaywrightOptions } from '../../PlaywrightOptions';
import { PlaywrightBrowsingSession } from './PlaywrightBrowsingSession';
import { PlaywrightPage } from './PlaywrightPage';

/**
 *  @group Models
 */
export class PlaywrightBrowsingSessionWithPage extends PlaywrightBrowsingSession {
    private readonly playwrightManagedPage: PlaywrightPage;
    constructor(
        protected readonly page: playwright.Page,
        browserContextOptions: PlaywrightOptions,
        selectors: playwright.Selectors,
    ) {
        super(browserContextOptions, selectors);
        this.playwrightManagedPage = new PlaywrightPage(this, this.page, this.browserContextOptions, CorrelationId.create());
    }

    protected override async registerCurrentPage(): Promise<PlaywrightPage> {
        await this.browserContext();

        this.register(this.playwrightManagedPage);

        return this.playwrightManagedPage;
    }

    protected override async createBrowserContext(options: PlaywrightOptions): Promise<playwright.BrowserContext> {
        return this.page.context();
    }

    /**
     * Closes any newly opened pages, leaving only the original one managed by Playwright Test.
     */
    async closeAllPages(): Promise<void> {
        for (const page of this.pages.values()) {
            if (! page.id.equals(this.playwrightManagedPage.id)) {
                await page.close();
                this.pages.delete(page.id);
            }
        }

        this.currentBrowserPage = this.playwrightManagedPage;
    }

    override async browserCapabilities(): Promise<BrowserCapabilities> {
        const browser = await this.page.context().browser();
        return {
            browserName: (browser as any)._initializer.name,   // todo: raise a PR to Playwright to expose this information
            platformName: process.platform,                    // todo: get the actual platform from Playwright
            browserVersion: browser.version()
        }
    }
}
