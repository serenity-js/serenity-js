import type * as playwright from 'playwright-core';

/**
 * Playwright-specific options used to configure the ability to [`BrowseTheWebWithPlaywright`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/)
 *
 * ## Learn more
 * - [Playwright `Browser.newContext` options](https://playwright.dev/docs/api/class-browser#browser-new-context)
 *
 * @group Configuration
 */
export interface PlaywrightOptions extends playwright.BrowserContextOptions {

    /**
     * Changes the default maximum navigation time for the browser context used by [`BrowseTheWebWithPlaywright`](https://serenity-js.org/api/playwright/class/BrowseTheWebWithPlaywright/)
     *
     * #### Learn more
     * - [Playwright `browserContext.setDefaultNavigationTimeout(timeout)`](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-default-navigation-timeout)
     */
    defaultNavigationTimeout?: number;

    /**
     * When to consider navigation operation succeeded, defaults to `load`. Events can be either:
     * - `'domcontentloaded'` - consider operation to be finished when the `DOMContentLoaded` event is fired.
     * - `'load'` - consider operation to be finished when the `load` event is fired.
     * - `'networkidle'` - consider operation to be finished when there are no network connections for at least `500` ms.
     * - `'commit'` - consider operation to be finished when network response is received and the document started loading.
     *
     * #### Learn more
     * - [Playwright `page.goto(url[, options])`](https://playwright.dev/docs/api/class-page#page-goto-option-wait-until)
     */
    defaultNavigationWaitUntil?: 'load'|'domcontentloaded'|'networkidle'|'commit';

    /**
     * This setting will change the default maximum time for all Playwright methods accepting `timeout` option.
     *
     * #### Learn more
     * - [Playwright `page.setDefaultTimeout(timeout)`](https://playwright.dev/docs/api/class-page#page-set-default-timeout)
     */
    defaultTimeout?: number;
}
