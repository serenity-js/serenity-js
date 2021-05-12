/**
 * @desc
 *  Configuration options to be passed to [Cucumber CLI](https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md).
 *  You can specify the options using either camelCase (i.e. `retryTagFilter`) or kebab-case (i.e. `retry-tag-filter`)
 *  as Serenity/JS will convert them to an appropriate format for you.
 *
 * @public
 */
export interface CucumberConfig {

    /**
     * @desc
     *  Enable/disable colors in output. Cucumber 1.x only!
     *  For Cucumber 2.x and above use `formatOptions: { colorsEnabled: false }`
     *
     *  **Please note** For Cucumber 2.x and above use the {@link CucumberConfig#formatOptions} instead.
     *
     * @example <caption>Disable colors in output in Cucumber 1.x</caption>
     *  colors: false
     *
     * @example <caption>Disable colors in output in Cucumber 2.x and above</caption>
     *  formatOptions: { colorsEnabled: false }
     *
     * @type {string}
     * @see https://github.com/cucumber/cucumber-js/blob/1.x/lib/cucumber/cli.js#L38
     * @version 1.x
     */
    colors?: boolean

    /**
     * @desc
     *  Step definitions and support files can be written in languages that transpile to JavaScript.
     *  To do set the `compiler` option to <file_extension>:<module_name>
     *
     *  **Please note** For Cucumber 4.x and above use the {@link CucumberConfig#require} option instead.
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
     * @type {string[] | string}
     * @see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#formats
     */
    format?: string[] | string;

    /**
     * @desc
     *  Provide options for formatters
     *
     * @example <caption>Cucumber 1.x</caption>
     *  formatOptions: JSON.stringify({ option: 'value' })
     *
     * @type {object|string}
     * @see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#format-options
     */
    formatOptions?: object | string;    // eslint-disable-line @typescript-eslint/ban-types

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
     *  The number of times to retry a failing scenario before marking it as failed.
     *
     * @example <caption>Cucumber 7.x</caption>
     *  retry: 3
     *
     * @type {number}
     * @see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#retry-failing-tests
     *
     * @version 7.x
     */
    retry?: number;

    /**
     * @desc
     *  Relative path to an output file produced by Cucumber.js [`rerun` formatter](https://github.com/cucumber/cucumber-js/blob/master/features/rerun_formatter.feature).
     *  Please note that the name of the output file *must* start with an `@` symbol.
     *
     * @example <caption>Saving details of failed scenarios to @rerun-output.txt</caption>
     *  format: [ 'rerun:@rerun-output.txt' ]
     *
     * @example <caption>Re-running scenarios saved to @rerun-output.txt</caption>
     *  rerun: '@rerun-output.txt'
     */
    rerun?: string;

    /**
     * @desc
     *  Only retry tests matching the given [tag expression](https://github.com/cucumber/cucumber/tree/master/tag-expressions).
     *
     * @example <caption>Cucumber 7.x</caption>
     *  retry: 3,
     *  retryTagFilter: '@flaky',
     *
     * @type {string}
     * @see  https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#retry-failing-tests
     *
     * @version 7.x
     */
    retryTagFilter?: string

    /**
     * @desc
     *  Require files or node modules before executing features
     *
     * @example <caption>Enable TypeScript support in Cucumber 4.x and above</caption>
     *  require: 'ts:ts-node/register'
     *
     * @type {string}
     * @see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#requiring-support-files
     */
    require?: string[];

    /**
     * @desc
     *  Only run scenarios that match the given tags.
     *
     *  **Please note**: Cucumber 1.x requires the `tags` option to be an array of Cucumber tags,
     *  while Cucumber 2.x and above uses a `string` with a [tag expression](https://github.com/cucumber/cucumber/tree/master/tag-expressions).
     *
     * @example <caption>Cucumber 1.x</caption>
     * // Run all scenarios tagged with `@smoketest`, but not with `@wip`:
     * tag: [ '@smoketest', '~@wip' ]
     *
     * @example <caption>Cucumber >= 2.x</caption>
     * // Run all scenarios tagged with `@smoketest`, but not with `@wip`:
     * tag: '@smoketest and not @wip'
     *
     * @type {string[]|string}
     * @see https://github.com/cucumber/cucumber-js/blob/1.x/docs/cli.md#tags
     * @see https://github.com/cucumber/cucumber-js/blob/2.x/docs/cli.md#tags
     * @see https://github.com/cucumber/cucumber/tree/master/tag-expressions
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
     * @example <caption>worldParameters as string</caption>
     *  worldParameters: JSON.stringify({ isDev: process.env.NODE_ENV !== 'production' })
     *
     * @example <caption>worldParameters as object</caption>
     *  worldParameters: { isDev: process.env.NODE_ENV !== 'production' }
     *
     * @type {object | string}
     * @see https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#world-parameters
     */
    worldParameters?: object | string;  // eslint-disable-line @typescript-eslint/ban-types
}
