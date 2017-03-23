/**
 * @see {@link https://github.com/cucumber/cucumber-js/blob/2d7c2523ddd88153a45d86f0e0f2a50c16814d1f/src/cli/argv_parser.js#L27}
 */
export interface CucumberOptions {
    failFast?: boolean;

    backtrace?: boolean;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#transpilers
     */
    compiler?: string;

    dryRun?: boolean;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#formats
     */
    format?: string;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#format-options
     */
    formatOptions?: string;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#running-specific-features
     */
    name?: string[];

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#profiles
     */
    profile?: string[];

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#requiring-support-files
     */
    require?: string[];

    strict?: boolean;

    /**
     * @link https://docs.cucumber.io/tag-expressions/
     */
    tags?: string;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#world-parameters
     */
    worldParameters?: string;
}
