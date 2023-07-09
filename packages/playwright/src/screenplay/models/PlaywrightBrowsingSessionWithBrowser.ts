import type { BrowserCapabilities } from '@serenity-js/web';
import type * as playwright from 'playwright-core';

import type { PlaywrightOptions } from '../../PlaywrightOptions';
import { PlaywrightBrowsingSession } from './PlaywrightBrowsingSession';

export class PlaywrightBrowsingSessionWithBrowser extends PlaywrightBrowsingSession {
    constructor(
        protected readonly browser: playwright.Browser,
        browserContextOptions: PlaywrightOptions,
    ) {
        super(browserContextOptions);
    }

    protected override createBrowserContext(options: PlaywrightOptions): Promise<playwright.BrowserContext> {
        return this.browser.newContext(this.browserContextOptions);
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
