import type { Discardable } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/web';
import * as playwright from 'playwright-core';

import type { PlaywrightOptions } from '../../PlaywrightOptions';
import {
    PlaywrightBrowsingSessionWithBrowser,
    PlaywrightBrowsingSessionWithPage
} from '../models';

/**
 * This implementation of the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * enables the [`Actor`](https://serenity-js.org/api/core/class/Actor/) to interact with web front-ends using [Playwright](https://playwright.dev/).
 *
 * ## Using Playwright to `BrowseTheWeb`
 *
 * In the example below, we configure the ability to [`BrowseTheWebWithPlaywright`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/) with a Playwright
 * [`Browser`](https://playwright.dev/docs/api/class-browser) so that Serenity/JS [actors](https://serenity-js.org/api/core/class/Actor/)
 * can create a new [`BrowserContext`](https://playwright.dev/docs/api/class-browsercontext) and
 * instantiate Playwright [`page`s](https://playwright.dev/docs/api/class-page) as and when needed.
 *
 * This configuration allows Serenity/JS to control the process of launching and shutting down browser instances
 * and is useful when your test runner, e.g. [Cucumber.js](https://serenity-js.org/api/cucumber), doesn't offer this functionality.
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
 * ## Using `BrowseTheWeb` with an existing Playwright `page`
 *
 * Test runners like [Playwright Test](https://serenity-js.org/api/playwright-test/) manage Playwright browsers for you
 * and offer a [`page`](https://playwright.dev/docs/api/class-page) instance you can
 * inject into the ability to [`BrowseTheWebWithPlaywright`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/).
 *
 * Note that [Serenity/JS Playwright Test module](https://serenity-js.org/api/playwright-test/)
 * automatically configures all your [actors](https://serenity-js.org/api/core/class/Actor/)
 * with an ability to [`BrowseTheWebWithPlaywright`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/),
 * so you don't need to do it by hand unless you want to override the [default configuration](https://serenity-js.org/api/playwright-test/interface/SerenityOptions/).
 *
 * The example below demonstrates how to use the [`BrowseTheWebWithPlaywright.usingPage`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/#usingPage) API and
 * override the default [cast](https://serenity-js.org/api/core/class/Cast/) of actors.
 *
 * ```ts
 * import { describe, it, test } from '@playwright/playwright-test'
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { By, Navigate, PageElement, Text } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * const HomePage = {
 *   title: () =>
 *     PageElement.located(By.css('h1')).describedAs('title')
 * }
 *
 * describe('Serenity/JS with Playwright', () => {
 *
 *   test.use({
 *     actors: async ({ page, contextOptions }, use) => {
 *       await use(
 *         Cast.where((actorName: string) => {
 *           return actor.whoCan(
 *             BrowseTheWebWithPlaywright.usingPage(page),
 *             // ... add any other abilities
 *           )
 *         })
 *       )
 *     }
 *   })
 *
 *   it('lets you reuse an existing page', async ({ actor }) => {
 *     await actor.attemptsTo(
 *       Navigate.to(`https://serenity-js.org`),
 *       Ensure.that(Text.of(HomePage.title()), equals('Serenity/JS')),
 *     )
 *   })
 * })
 * ```
 *
 * ## Configuring Playwright
 *
 * If you're using Serenity/JS with [Playwright Test](https://serenity-js.org/handbook/test-runners/playwright-test/),
 * Serenity/JS will automatically pick up your configuration from the [`playwright.config.ts`](https://playwright.dev/docs/test-configuration) file.
 *
 * With other [test runners](https://serenity-js.org/handbook/test-runners/), you can configure Playwright by:
 * - providing the browser-level configuration when calling [`BrowserType.launch`](https://playwright.dev/docs/api/class-browsertype#browser-type-launch),
 * - providing the browser context-level [`PlaywrightOptions`](https://serenity-js.org/api/playwright/interface/PlaywrightOptions/)
 * when initialising the ability to `BrowseTheWebWithPlaywright`.
 *
 * The code snippet below demonstrates how to configure the browser and some popular browser context options,
 * such as
 * [`viewport` size](https://playwright.dev/docs/api/class-browser#browser-new-context-option-viewport),
 * [`geolocation`](https://playwright.dev/docs/api/class-browser#browser-new-page-option-geolocation),
 * and [`permissions`](https://playwright.dev/docs/api/class-browser#browser-new-page-option-permissions),
 * but you can use it to configure any other option available in Playwright, like
 * [`userAgent`](https://playwright.dev/docs/api/class-browser#browser-new-context-option-user-agent)
 * or [`storageState`](https://playwright.dev/docs/api/class-browser#browser-new-context-option-storage-state).
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { Navigate } from '@serenity-js/web'
 * import { Browser, chromium } from 'playwright'
 *
 * // specify browser launch options
 * const browser = await chromium.launch({
 *   headless: true
 * });
 *
 * await actorCalled('Wendy')
 *   .whoCan(BrowseTheWebWithPlaywright.using(browser, {
 *      // specify browser context options
 *      viewport:    { width: 1600, height: 1200 },
 *      geolocation: { longitude: 51.50084271042897, latitude: -0.12462540129500639 },
 *      permissions: [ 'geolocation' ],
 *
 *      defaultNavigationTimeout: 30_000,
 *      defaultTimeout: 10_000
 *
 *      // ... and so on
 *   }))
 *   .attemptsTo(
 *     Navigate.to(`https://serenity-js.org`),
 *     // ...
 *   )
 * ```
 *
 * Note that in addition to all the standard Playwright BrowserContextOptions, you can also provide several others defined in Serenity/JS [`PlaywrightOptions`](https://serenity-js.org/api/playwright/interface/PlaywrightOptions/), such as:
 * - `defaultNavigationTimeout`, which changes the default maximum navigation timeout for the browser context,
 * - `defaultTimeout`, which changes the default maximum time for all Playwright methods accepting the `timeout` option.
 *
 * ## Learn more
 * - [Full list of Playwright `BrowserContextOptions`](https://playwright.dev/docs/api/class-browser#browser-new-context)
 * - [Playwright website](https://playwright.dev/)
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`Ability`](https://serenity-js.org/api/core/class/Ability/)
 * - [`Actor`](https://serenity-js.org/api/core/class/Actor/)
 *
 * @group Abilities
 */
export class BrowseTheWebWithPlaywright extends BrowseTheWeb<playwright.Locator> implements Discardable {

    static using(browser: playwright.Browser, options?: PlaywrightOptions): BrowseTheWebWithPlaywright {
        return new BrowseTheWebWithPlaywright(new PlaywrightBrowsingSessionWithBrowser(browser, options, playwright.selectors));
    }

    static usingPage(page: playwright.Page, options?: PlaywrightOptions): BrowseTheWebWithPlaywright {
        return new BrowseTheWebWithPlaywright(new PlaywrightBrowsingSessionWithPage(page, options, playwright.selectors));
    }

    /**
     * Automatically closes any open [pages](https://serenity-js.org/api/web/class/Page/) when the [SceneFinishes](https://serenity-js.org/api/core-events/class/SceneFinishes/)
     *
     * #### Learn more
     * - [`PlaywrightBrowsingSession.closeAllPages`](https://serenity-js.org/api/playwright/class/PlaywrightBrowsingSession/#closeAllPages)
     * - [`Discardable`](https://serenity-js.org/api/core/interface/Discardable/)
     */
    async discard(): Promise<void> {
        await this.session.closeAllPages();
    }
}
