import * as playwright from 'playwright-core';

/**
 * @desc
 *  Playwright-specific options used to configure the ability to {@link BrowseTheWebWithPlaywright}
 *
 * @extends {playwright~BrowserContextOptions}
 */
export interface PlaywrightOptions extends playwright.BrowserContextOptions {
    /**
     * @desc
     *  This setting will change the default maximum navigation time for the browser context used by {@link BrowseTheWebWithPlaywright}
     *
     * @see https://playwright.dev/docs/api/class-browsercontext#browser-context-set-default-navigation-timeout
     *
     * @type {?number}
     */
    defaultNavigationTimeout?: number;

    /**
     * @desc
     *  When to consider navigation operation succeeded, defaults to `load`. Events can be either:
     *  - `'domcontentloaded'` - consider operation to be finished when the `DOMContentLoaded` event is fired.
     *  - `'load'` - consider operation to be finished when the `load` event is fired.
     *  - `'networkidle'` - consider operation to be finished when there are no network connections for at least `500` ms.
     *  - `'commit'` - consider operation to be finished when network response is received and the document started loading.
     *
     * @see https://playwright.dev/docs/api/class-page#page-goto-option-wait-until
     *
     * @type {?string}
     */
    defaultNavigationWaitUntil?: 'load'|'domcontentloaded'|'networkidle'|'commit';

    /**
     * @desc
     *  This setting will change the default maximum time for all Playwright methods accepting `timeout` option.
     *
     * @see https://playwright.dev/docs/api/class-page#page-set-default-timeout
     *
     * @type {?number}
     */
    defaultTimeout?: number;
}
