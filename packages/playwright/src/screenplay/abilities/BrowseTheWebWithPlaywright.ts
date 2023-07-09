import type { Discardable } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/web';
import type * as playwright from 'playwright-core';

import type { PlaywrightOptions } from '../../PlaywrightOptions';
import { PlaywrightBrowsingSessionWithBrowser } from '../models/PlaywrightBrowsingSessionWithBrowser';

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
export class BrowseTheWebWithPlaywright extends BrowseTheWeb<playwright.Locator> implements Discardable {

    static using(browser: playwright.Browser, options?: PlaywrightOptions): BrowseTheWebWithPlaywright {
        return new BrowseTheWebWithPlaywright(new PlaywrightBrowsingSessionWithBrowser(browser, options));
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
}
