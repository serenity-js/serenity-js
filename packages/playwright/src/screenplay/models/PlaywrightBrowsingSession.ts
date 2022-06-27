import { CorrelationId } from '@serenity-js/core/lib/model';
import { BrowsingSession, Cookie, CookieData } from '@serenity-js/web';
import * as playwright from 'playwright-core';

import { PlaywrightOptions } from '../../PlaywrightOptions';
import { PlaywrightCookie, PlaywrightPage } from '../models';

/**
 * @desc
 *  Playwright-specific implementation of the {@link @serenity-js/web/lib/screenplay/models~BrowsingSession}.
 *
 * @see {@link @serenity-js/web/lib/screenplay/models~BrowsingSession}
 */
export class PlaywrightBrowsingSession extends BrowsingSession<PlaywrightPage> {

    private currentPlaywrightBrowserContext: playwright.BrowserContext;

    constructor(
        protected readonly browser: playwright.Browser,
        protected readonly browserContextOptions: PlaywrightOptions,
    ) {
        super();
    }

    protected async registerCurrentPage(): Promise<PlaywrightPage> {
        const context = await this.browserContext();

        await context.newPage();

        // newPage triggers a callback registered via browserContext()

        const allPages = await this.allPages()

        return allPages[allPages.length-1];
    }

    /**
     * @override
     */
    async closeAllPages(): Promise<void> {
        await super.closeAllPages();

        const context = await this.browserContext();
        await context.close();
    }

    async cookie(name: string): Promise<Cookie> {
        const context = await this.browserContext();
        return new PlaywrightCookie(context, name);
    }

    async setCookie(cookie: CookieData): Promise<void> {
        const context = await this.browserContext();

        await context.addCookies([ cookie ]);
    }

    async deleteAllCookies(): Promise<void> {
        const context = await this.browserContext()
        await context.clearCookies();
    }

    private async browserContext(): Promise<playwright.BrowserContext> {
        if (! this.currentPlaywrightBrowserContext) {
            this.currentPlaywrightBrowserContext = await this.browser.newContext(this.browserContextOptions);

            this.currentPlaywrightBrowserContext.on('page', async page => {
                await page.waitForLoadState();

                this.register(
                    new PlaywrightPage(this, page, CorrelationId.create())
                );
            });

            if (this.browserContextOptions?.defaultNavigationTimeout) {
                this.currentPlaywrightBrowserContext.setDefaultNavigationTimeout(this.browserContextOptions?.defaultNavigationTimeout);
            }

            if (this.browserContextOptions?.defaultTimeout) {
                this.currentPlaywrightBrowserContext.setDefaultTimeout(this.browserContextOptions?.defaultTimeout);
            }
        }

        return this.currentPlaywrightBrowserContext;
    }
}
