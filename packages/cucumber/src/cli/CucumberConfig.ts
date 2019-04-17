export interface CucumberConfig {
    /**
     * @desc
     *  Step definitions and support files can be written in languages that transpile to JavaScript.
     *  To do set the `compiler` option to <file_extension>:<module_name>
     *
     *  For Cucumber 4.x and above use the `require` option instead.
     *
     * @example <caption>Enable TypeScript support in Cucumber 1.x - 3.x</caption>
     *  compiler: 'ts:ts-node/register'
     *
     * @link https://github.com/cucumber/cucumber-js/blob/3.x/docs/cli.md#transpilers
     * @version 1.x - 3.x
     */
    compiler?: string;

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

    /**
     * @desc
     *  Cucumber 1.x requires the `tags` option to be an array of Cucumber tags.
     *  For example, to run all scenarios tagged with `@smoketest`, but not with `@wip`:
     *
     * @example <caption>Cucumber 1.x</caption>
     * tag: [ '@smoketest', '~@wip' ]
     *
     * @example <caption>Cucumber >= 2.x</caption>
     * tag: '@smoketest and not @wip'
     *
     * @link https://github.com/cucumber/cucumber-js/blob/1.x/docs/cli.md#tags
     * @link https://github.com/cucumber/cucumber-js/blob/2.x/docs/cli.md#tags
     *
     */
    tags?: string[] | string;

    /**
     * @link https://github.com/angular/protractor/blob/e5a5d59fcabe15860b30944e714bbd8e81ceaeae/docs/frameworks.md#using-cucumber
     */
    strict?: boolean;

    'no-colors'?: boolean;

    /**
     * @link https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#world-parameters
     */
    worldParameters?: string;
}
