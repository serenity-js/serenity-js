import { Discardable } from '@serenity-js/core';
import { BrowserCapabilities, BrowseTheWeb } from '@serenity-js/web';
import type * as playwright from 'playwright-core';

import { PlaywrightOptions } from '../../PlaywrightOptions';
import { PlaywrightBrowsingSession } from '../models';

/**
 * This implementation of the {@apilink Ability|ability} to {@apilink BrowseTheWeb}
 * enables the {@apilink Actor} to interact with web front-ends using [Playwright](https://playwright.dev/).
 *
 * ## Using Playwright to `BrowseTheWeb`
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { By, Navigate, PageElement, Text } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { Browser, chromium } from 'playwright'
 *
 * const HomePage = {
 *   title: () =>
 *     PageElement.located(By.css('h1')).describedAs('title')
 * }
 *
 * const browser = await chromium.launch({ headless: true });
 *
 * await actorCalled('Wendy')
 *   .whoCan(BrowseTheWebWithPlaywright.using(browser))
 *   .attemptsTo(
 *     Navigate.to(`https://serenity-js.org`),
 *     Ensure.that(Text.of(HomePage.title()), equals('Serenity/JS')),
 *   )
 * ```
 *
 * ## Learn more
 * - [Playwright website](https://playwright.dev/)
 * - {@apilink BrowseTheWeb}
 * - {@apilink Ability}
 * - {@apilink Actor}
 *
 * @group Abilities
 */
export class BrowseTheWebWithPlaywright extends BrowseTheWeb<playwright.ElementHandle> implements Discardable {

    static using(browser: playwright.Browser, options?: PlaywrightOptions): BrowseTheWebWithPlaywright {
        return new BrowseTheWebWithPlaywright(browser, options);
    }

    constructor(protected readonly browser: playwright.Browser, browserContextOptions: PlaywrightOptions = {}) {
        super(new PlaywrightBrowsingSession(browser, browserContextOptions));
    }

    /**
     * Automatically closes any open {@apilink Page|Pages} when the {@apilink SceneFinishes}
     *
     * #### Learn more
     * - {@apilink PlaywrightBrowsingSession.closeAllPages}
     * - {@apilink Discardable}
     */
    async discard(): Promise<void> {
        await this.session.closeAllPages();
    }

    /**
     * Returns {@apilink BrowserCapabilities|basic meta-data} about the browser associated with this ability.
     *
     * **Please note** that since Playwright does not expose information about the operating system
     * the tests are running on, **Serenity/JS assumes that the tests are running locally**
     * and therefore returns the value of Node.js `process.platform` for `platformName`.
     */
    async browserCapabilities(): Promise<BrowserCapabilities> {
        return {
            browserName: (this.browser as any)._initializer.name,   // todo: raise a PR to Playwright to expose this information
            platformName: process.platform,                         // todo: get the actual platform from Playwright
            browserVersion: this.browser.version()
        }
    }
}
