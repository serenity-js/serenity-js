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
     *  This setting will change the default maximum time for all Playwright methods accepting `timeout` option.
     *
     * @see https://playwright.dev/docs/api/class-page#page-set-default-timeout
     *
     * @type {?number}
     */
    defaultTimeout?: number;
}
