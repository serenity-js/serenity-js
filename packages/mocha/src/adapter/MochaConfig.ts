/**
 * Configuration object for the Mocha test runner.
 *
 * ## Learn more
 *
 * - [`.mocharc.yml` example](https://github.com/mochajs/mocha/blob/v8.0.1/example/config/.mocharc.yml)
 *
 * @group Configuration
 */
export interface MochaConfig {

    /**
     * Path to config file.
     *
     * #### Learn more
     * - [Mocha configuration examples](https://github.com/mochajs/mocha/tree/v8.0.1/example/config)
     */
    config?: string;

    /**
     * Allow uncaught errors to propagate.
     */
    'allow-uncaught'?: boolean;

    /**
     * Require all tests to use a callback (async) or return a Promise.
     */
    'async-only'?: boolean;

    /**
     * Abort ("bail") after first test failure.
     */
    bail?: boolean;

    /**
     * Check for global variable leaks.
     */
    'check-leaks'?: boolean;

    /**
     * Delay initial execution of root suite.
     */
    delay?: boolean;

    /**
     * Only run tests containing this string.
     *
     * **Note:** [`MochaConfig.fgrep`](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/#fgrep) and [`MochaConfig.grep`](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/#grep) are mutually exclusive.
     */
    fgrep?: string;

    /**
     * Files to be loaded prior to root suite execution.
     */
    file?: string[];

    /**
     * Fail if exclusive test(s) encountered.
     */
    'forbid-only'?: boolean;

    /**
     * Fail if pending test(s) encountered.
     */
    'forbid-pending': boolean;

    /**
     * List of allowed global variables.
     */
    global?: string[];

    /**
     * Only run tests matching this string or regexp.
     *
     * **Note:** [`MochaConfig.grep`](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/#grep) and [`MochaConfig.fgrep`](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/#fgrep) are mutually exclusive.
     */
    grep?: string | RegExp;

    /**
     * Enable Growl notifications.
     */
    growl?: boolean;

    /**
     * Inverts [`MochaConfig.grep`](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/#grep) and [`MochaConfig.fgrep`](https://serenity-js.org/api/mocha-adapter/interface/MochaConfig/#fgrep) matches.
     */
    invert?: boolean;

    /**
     * Require module.
     */
    require?: string[];

    /**
     * Retry failed tests this many times.
     */
    retries?: number;

    /**
     * Specify "slow" test threshold (in milliseconds).
     */
    slow?: number;

    /**
     * Specify test timeout threshold (in milliseconds).
     *
     * **Note:** setting this property to 0 means "no timeout".
     */
    timeout?: number;

    /**
     * Specify user interface. Defaults to `bdd`.
     *
     * #### Learn more
     *
     * - [Mocha interfaces](https://mochajs.org/#interfaces)
     */
    ui?: string;

    /**
     * When set to `true`, a skipped test is considered a failure.
     */
    strict?: boolean;
}
