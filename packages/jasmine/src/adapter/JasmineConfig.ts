import { JasmineReporter } from '../jasmine';

/**
 * Configuration object that will be passed to the JasmineRunner.
 *
 * ## Learn more
 * - [Jasmine configuration](https://jasmine.github.io/setup/nodejs.html)
 *
 * @group Configuration
 */
export interface JasmineConfig {

    /**
     * A list of paths to helper files that should be loaded and executed before the `requires` and the `specs`.
     * Accepts relative and absolute paths as well as glob expressions.
     *
     * #### Learn more
     * - [Jasmine tutorial](https://jasmine.github.io/tutorials/react_with_npm)
     */
    helpers?: string[];

    /**
     * A list of paths to files that should be required after the `helpers`, but before the `specs`.
     * The paths need to be compatible with Node `require`.
     */
    requires?: string[];

    /**
     * Whether or not the tests should be executed in a pseudo-random order.
     */
    random?: boolean;

    /**
     * Used to exclude any test scenarios which name doesn't match the pattern from the run.
     */
    grep?: string | RegExp;

    /**
     * Inverts 'grep' matches, defaults to `false`
     */
    invertGrep?: boolean;

    /**
     * Receives the full name of a test scenario and returns `true`
     * for those that should be executed.
     *
     * Takes precedence over `grep`.
     */
    specFilter?: (specName: string) => boolean

    /**
     * The randomisation seed that will be used to determine the pseudo-random order of execution,
     * if `random` is set to `true`
     */
    seed?: string;

    /**
     * Sets the global `jasmine.DEFAULT_TIMEOUT_INTERVAL`,
     * which defines the default number of milliseconds Jasmine will wait for an asynchronous spec to complete.
     *
     * #### Learn more
     * - [Jasmine default timeout interval](https://jasmine.github.io/api/edge/jasmine#.DEFAULT_TIMEOUT_INTERVAL)
     */
    defaultTimeoutInterval?: number;

    /**
     * A list of Jasmine reporters to be added to the test runner.
     *
     * Useful for situations like configuring ReportPortal, because you cannot use `jasmine.addReporter()` in the Protractor config.
     *
     * **Note:** reporters must be instantiated before adding them to the configuration.
     *
     * #### Using ReportPortal with Protractor and Jasmine
     *
     * ```js
     * // protractor.conf.js
     * const AgentJasmine = require('@reportportal/agent-js-jasmine')
     * const agent = new AgentJasmine(require('./reportportalConf'))
     * // ...
     * jasmineNodeOpts: {
     *   // ...
     *   reporters: [ agent.getJasmineReporter() ],
     * }
     *
     * afterLaunch:() => {
     *   return agent.getExitPromise();
     * },
     * ```
     */
    reporters?: JasmineReporter[];
}
