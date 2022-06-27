import { Discardable } from '@serenity-js/core';
import { BrowserCapabilities, BrowseTheWeb, ModalDialog } from '@serenity-js/web';
import * as playwright from 'playwright-core';

import { PlaywrightOptions } from '../../PlaywrightOptions';
import { PlaywrightBrowsingSession } from '../models';

/**
 * @desc
 *  An {@link @serenity-js/core/lib/screenplay~Ability} that enables the {@link Actor}
 *  to interact with web front-ends using [Playwright](https://playwright.dev/).
 *
 * @example <caption>Using a Playwright browser</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
 *  import { By, Navigate, PageElement } from '@serenity-js/web';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { Browser, chromium } from 'playwright';
 *
 *  const HomePage = {
 *      title: PageElement.located(By.css('h1')).describedAs('title')
 *  }
 *
 *  const browser = await chromium.launch({ headless: true });
 *
 *  await actorCalled('Wendy')
 *      .whoCan(BrowseTheWebWithPlaywright.using(browser))
 *      .attemptsTo(
 *          Navigate.to(`https://serenity-js.org`),
 *          Ensure.that(Text.of(HomePage.title), equals('Serenity/JS')),
 *      );
 *
 * @extends {@serenity-js/web/lib/screenplay/abilities~BrowseTheWeb}
 *
 * @public
 *
 * @see https://playwright.dev/
 * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
 */
export class BrowseTheWebWithPlaywright extends BrowseTheWeb implements Discardable {

    /**
     * @param {playwright~Browser} browser
     * @param {PlaywrightOptions} options
     * @returns {BrowseTheWebWithPlaywright}
     */
    static using(browser: playwright.Browser, options?: PlaywrightOptions): BrowseTheWebWithPlaywright {
        return new BrowseTheWebWithPlaywright(browser, options);
    }

    /**
     * @param {playwright~Browser} browser
     * @param {PlaywrightOptions} browserContextOptions
     */
    protected constructor(protected readonly browser: playwright.Browser, browserContextOptions: PlaywrightOptions = {}) {
        super(new PlaywrightBrowsingSession(browser, browserContextOptions));
    }

    /**
     * @desc
     *  Automatically closes any open {@link Page}s when the {@link SceneFinishes}
     *
     * @see {@link PlaywrightBrowsingSession#closeAllPages}
     * @see {@link @serenity-js/core/lib/screenplay/abilities~Discardable}
     */
    async discard(): Promise<void> {
        await this.session.closeAllPages();
    }

    /**
     * @desc
     *  Returns basic meta-data about the browser associated with this ability.
     *
     *  **Please note** that since Playwright does not expose information about the operating system
     *  the tests are running on, **Serenity/JS assumes that the tests are running locally**
     *  and therefore returns the value of Node.js `process.platform` for `platformName`.
     *
     * @returns {Promise<BrowserCapabilities>}
     *
     * @see {@link @serenity-js/web/lib/screenplay/abilities~BrowserCapabilities}
     */
    async browserCapabilities(): Promise<BrowserCapabilities> {
        return {
            browserName: (this.browser as any)._initializer.name,   // todo: raise a PR to Playwright to expose this information
            platformName: process.platform,                         // todo: get the actual platform from Playwright
            browserVersion: this.browser.version()
        }
    }

    modalDialog(): Promise<ModalDialog> {
        throw new Error('Method not implemented.');
    }
}
