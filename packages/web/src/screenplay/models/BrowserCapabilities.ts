/**
 * Basic meta-data about the browser used in the test
 *
 * ## Learn more
 *
 * - [`BrowseTheWeb.browserCapabilities`](https://serenity-js.org/api/web/class/BrowseTheWeb/#browserCapabilities)
 *
 * @group Models
 */
export interface BrowserCapabilities {

    /**
     * Name of the operating system platform the test is executed on, like `darwin`, `linux` or `windows`.
     */
    platformName?: string;

    /**
     * Name of the Web browser the test is executed in, like `chrome`, `firefox` or `safari`.
     */
    browserName?: string;

    /**
     * Version number of the browser the test is executed in.
     */
    browserVersion?: string;
}
