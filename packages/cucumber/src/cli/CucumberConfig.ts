/**
 * @public
 */
export interface CucumberConfig {
    /**
     * @desc
     *  Step definitions and support files can be written in languages that transpile to JavaScript.
     *  To do set the `compiler` option to <file_extension>:<module_name>
     *
     *  For Cucumber 4.x and above use the {@link CucumberConfig#require} option instead.
     *
     * @example <caption>Enable TypeScript support in Cucumber 1.x - 3.x</caption>
     *  compiler: 'ts:ts-node/register'
     *
     * @type {string}
     * @see https://github.com/cucumber/cucumber-js/blob/3.x/docs/cli.md#transpilers
     * @version 1.x - 3.x
     */
    compiler?: string;

    /**
     * @desc
     *  Specify additional output formats, optionally supply PATH to redirect formatter output
     *
     * @type {string}
     * @see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#formats
     */
    format?: string;

    /**
     * @desc
     *  Provide options for formatters
     *
     * @example <caption>Cucumber 1.x</caption>
     *  formatOptions: JSON.stringify({ option: 'value' })
     *
     * @type {string}
     * @see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#format-options
     */
    formatOptions?: string;

    /**
     * @desc
     *  Only execute the scenarios with name matching the expression.
     *
     * @type {string}
     * @see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#running-specific-features
     */
    name?: string[];

    /**
     * @desc
     *  In order to store and reuse commonly used CLI options,
     *  you can add a `cucumber.js` file to your project root directory.
     *  The file should export an object where the key is the profile name
     *  and the value is a string of CLI options.
     *
     *  The profile can be applied with -p <NAME> or --profile <NAME>.
     *  This will prepend the profile's CLI options to the ones provided by the command line.
     *  Multiple profiles can be specified at a time.
     *
     *  If no profile is specified and a profile named default exists,
     *  it will be applied.
     *
     * @type {string}
     * @see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#profiles
     */
    profile?: string[];

    /**
     * @desc
     *  Require files before executing features
     *
     * @type {string}
     * @see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#requiring-support-files
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
     * @type {string[]|string}
     * @see https://github.com/cucumber/cucumber-js/blob/1.x/docs/cli.md#tags
     * @see https://github.com/cucumber/cucumber-js/blob/2.x/docs/cli.md#tags
     */
    tags?: string[] | string;

    /**
     * @desc
     *  Fail if there are any undefined or pending steps
     *
     * @type {boolean}
     * @see https://github.com/angular/protractor/blob/e5a5d59fcabe15860b30944e714bbd8e81ceaeae/docs/frameworks.md#using-cucumber
     */
    strict?: boolean;

    /**
     * @desc
     *  Provide parameters that will be passed to the world constructor
     *
     * @example <caption>Cucumber 1.x</caption>
     * worldParameters: JSON.stringify({ isDev: process.env.NODE_ENV !== 'production' })
     *
     * @type {string}
     * @see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#world-parameters
     */
    worldParameters?: string;
}
