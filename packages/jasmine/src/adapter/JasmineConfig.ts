/**
 * @desc
 *  Configuration object that will be passed to the JasmineRunner.
 *
 * @see https://jasmine.github.io/setup/nodejs.html
 */
export interface JasmineConfig {

    /**
     * @desc
     *  A list of paths to helper files that should be loaded and executed before the `requires` and the `specs`.
     *  Accepts relative and absolute paths as well as glob expressions.
     *
     * @type {string[] | undefined}
     * @see https://jasmine.github.io/tutorials/react_with_npm
     */
    helpers?: string[];

    /**
     * @desc
     *  A list of paths to files that should be required after the `helpers`, but before the `specs`.
     *  The path need to be compatible with Node {@link require}.
     *
     * @type {string[] | undefined}
     */
    requires?: string[];

    /**
     * @desc
     *  Whether or not the tests should be executed in a pseudo-random order.
     *
     * @type {boolean | undefined}
     */
    random?: boolean;

    /**
     * @desc
     *  Used to exclude any test scenarios which name doesn't match the pattern from the run.
     *
     * @type {string | RegExp | undefined}
     */
    grep?: string | RegExp;

    /**
     * @desc
     *  The randomisation seed that will be used to determine the pseudo-random order of execution,
     *  if `random` is set to `true`
     *
     * @type {string | undefined}
     * @see {@link JasmineConfig#random}
     */
    seed?: string;

    /**
     * @desc
     *  Sets the global `jasmine.DEFAULT_TIMEOUT_INTERVAL`,
     *  which defines the default number of milliseconds Jasmine will wait for an asynchronous spec to complete.
     *
     * @type {number | undefined}
     * @see https://jasmine.github.io/api/edge/jasmine#.DEFAULT_TIMEOUT_INTERVAL
     */
    defaultTimeoutInterval?: number;
}
