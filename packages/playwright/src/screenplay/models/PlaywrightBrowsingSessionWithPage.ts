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
    constructor(
        protected readonly page: playwright.Page,
        browserContextOptions: PlaywrightOptions,
    ) {
        super(browserContextOptions);
        this.currentBrowserPage = new PlaywrightPage(this, this.page, this.browserContextOptions, CorrelationId.create());
    }

    protected override async createBrowserContext(options: PlaywrightOptions): Promise<playwright.BrowserContext> {
        return this.page.context();
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

