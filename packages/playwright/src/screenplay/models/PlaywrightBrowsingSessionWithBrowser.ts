import type { BrowserCapabilities } from '@serenity-js/web';
import type * as playwright from 'playwright-core';

import type { PlaywrightOptions } from '../../PlaywrightOptions';
import { SerenitySelectorEngines } from '../../selector-engines';
import { PlaywrightBrowsingSession } from './PlaywrightBrowsingSession';

/**
 *  @group Models
 */
export class PlaywrightBrowsingSessionWithBrowser extends PlaywrightBrowsingSession {
    private readonly serenitySelectorEngines = new SerenitySelectorEngines();

    constructor(
        protected readonly browser: playwright.Browser,
        browserContextOptions: PlaywrightOptions,
        private readonly selectors: playwright.Selectors,
    ) {
        super(browserContextOptions);
    }

    protected override async createBrowserContext(options: PlaywrightOptions): Promise<playwright.BrowserContext> {
        await this.serenitySelectorEngines.ensureRegisteredWith(this.selectors);

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
