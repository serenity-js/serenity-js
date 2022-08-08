/**
 * @desc
 *  Basic meta-data about the browser used in the test.
 *
 * @public
 */
export interface BrowserCapabilities {

    /**
     * @desc
     *  Name of the operating system platform the test is executed on, like `darwin`, `linux` or `windows`.
     *
     * @type {string | undefined}
     * @public
     */
    platformName?: string;

    /**
     * @desc
     *  Name of the Web browser the test is executed in, like `chrome`, `firefox` or `safari`.
     *
     * @type {string | undefined}
     * @public
     */
    browserName?: string;

    /**
     * @desc
     *  Version number of the browser the test is executed in.
     *
     * @type {string | undefined}
     * @public
     */
    browserVersion?: string;
}
