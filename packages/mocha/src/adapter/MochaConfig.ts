/**
 * @desc
 *  Configuration object for the Mocha test runner.
 *
 * @see https://github.com/mochajs/mocha/blob/v8.0.1/example/config/.mocharc.yml
 *
 * @public
 */
export interface MochaConfig {

    /**
     * @desc
     *  Path to config file.
     *
     * @see https://github.com/mochajs/mocha/tree/v8.0.1/example/config
     *
     * @type {string | undefined}
     * @public
     */
    config?: string;

    /**
     * @desc
     *  Allow uncaught errors to propagate.
     *
     * @type {boolean | undefined}
     * @public
     */
    'allow-uncaught'?: boolean;

    /**
     * @desc
     *  Require all tests to use a callback (async) or return a Promise.
     *
     * @type {boolean | undefined}
     * @public
     */
    'async-only'?: boolean;

    /**
     * @desc
     *  Abort ("bail") after first test failure.
     *
     * @type {boolean | undefined}
     * @public
     */
    bail?: boolean;

    /**
     * @desc
     *  Check for global variable leaks.
     *
     * @type {boolean | undefined}
     * @public
     */
    'check-leaks'?: boolean;

    /**
     * @desc
     *  Delay initial execution of root suite.
     *
     * @type {boolean | undefined}
     * @public
     */
    delay?: boolean;

    /**
     * @desc
     *  Only run tests containing this string.
     *  Please note: {@link MochaConfig.fgrep} and {@link MochaConfig.grep} are mutually exclusive.
     *
     * @type {string | undefined}
     * @public
     */
    fgrep?: string;

    /**
     * @desc
     *  File(s) to be loaded prior to root suite execution.
     *
     * @type {string[] | undefined}
     * @public
     */
    file?: string[];

    /**
     * @desc
     *  Fail if exclusive test(s) encountered.
     *
     * @type {boolean | undefined}
     * @public
     */
    'forbid-only'?: boolean;

    /**
     * @desc
     *  Fail if pending test(s) encountered.
     *
     * @type {boolean | undefined}
     * @public
     */
    'forbid-pending': boolean;

    /**
     * @desc
     *  List of allowed global variables.
     *
     * @type {string[] | undefined}
     * @public
     */
    global?: string[];

    /**
     * @desc
     *  Only run tests matching this string or regexp.
     *  Please note: {@link MochaConfig.fgrep} and {@link MochaConfig.grep} are mutually exclusive.
     *
     * @type {string | RegExp | undefined}
     * @public
     */
    grep?: string | RegExp;

    /**
     * @desc
     *  Enable Growl notifications.
     *
     * @type {boolean | undefined}
     * @public
     */
    growl?: boolean;

    /**
     * @desc
     *  Inverts {@link MochaConfig.grep} and {@link MochaConfig.fgrep} matches.
     *
     * @type {boolean | undefined}
     * @public
     */
    invert?: boolean;

    /**
     * @desc
     *  Require module.
     *
     * @type {string[] | undefined}
     * @public
     */
    require?: string[];

    /**
     * @desc
     *  Retry failed tests this many times.
     *
     * @type {number | undefined}
     * @public
     */
    retries?: number;

    /**
     * @desc
     *  Specify "slow" test threshold (in milliseconds).
     *
     * @type {number} [slow=75]
     * @public
     */
    slow?: number;

    /**
     * @desc
     *  Specify test timeout threshold (in milliseconds).
     *  Please note: setting this property to 0 means "no timeout".
     *
     * @type {number} [timeout=2000]
     * @public
     */
    timeout?: number;

    /**
     * @desc
     *  Specify user interface.
     *
     * @see https://mochajs.org/#interfaces
     *
     * @type {string} [ui="bdd"]
     * @public
     */
    ui?: string;

    /**
     * @desc
     *  When set to `true`, a skipped test is considered a failure.
     *
     * @see https://mochajs.org/#interfaces
     *
     * @type {boolean} [strict=false]
     * @public
     */
    strict?: boolean;
}
