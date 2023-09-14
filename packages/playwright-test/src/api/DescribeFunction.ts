import type { SuiteFunction } from './SuiteFunction';

// Playwright Test doesn't export all its public APIs, hence the need for this workaround
// See https://github.com/microsoft/playwright/pull/24146
export type DescribeFunction = SuiteFunction & {
    /**
     * Declares a focused group of tests. If there are some focused tests or suites, all of them will be run but nothing
     * else.
     *
     * **Usage**
     *
     * ```js
     * test.describe.only('focused group', () => {
     *   test('in the focused group', async ({ page }) => {
     *     // This test will run
     *   });
     * });
     * test('not in the focused group', async ({ page }) => {
     *   // This test will not run
     * });
     * ```
     *
     * @param title Group title.
     * @param callback A callback that is run immediately when calling
     * [test.describe.only(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-only). Any tests
     * added in this callback will belong to the group.
     */
    only: SuiteFunction;
    /**
     * Declares a skipped test group, similarly to
     * [test.describe(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-1). Tests in the skipped
     * group are never run.
     *
     * **Usage**
     *
     * ```js
     * test.describe.skip('skipped group', () => {
     *   test('example', async ({ page }) => {
     *     // This test will not run
     *   });
     * });
     * ```
     *
     * @param title Group title.
     * @param callback A callback that is run immediately when calling
     * [test.describe.skip(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-skip). Any tests
     * added in this callback will belong to the group, and will not be run.
     */
    skip: SuiteFunction;
    /**
     * Declares a test group similarly to
     * [test.describe(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-1). Tests in this group
     * are marked as "fixme" and will not be executed.
     *
     * **Usage**
     *
     * ```js
     * test.describe.fixme('broken tests', () => {
     *   test('example', async ({ page }) => {
     *     // This test will not run
     *   });
     * });
     * ```
     *
     * @param title Group title.
     * @param callback A callback that is run immediately when calling
     * [test.describe.fixme(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-fixme). Any tests
     * added in this callback will belong to the group, and will not be run.
     */
    fixme: SuiteFunction;
    /**
     * **NOTE** See [test.describe.configure([options])](https://playwright.dev/docs/api/class-test#test-describe-configure) for
     * the preferred way of configuring the execution mode.
     *
     * Declares a group of tests that should always be run serially. If one of the tests fails, all subsequent tests are
     * skipped. All tests in a group are retried together.
     *
     * **NOTE** Using serial is not recommended. It is usually better to make your tests isolated, so they can be run
     * independently.
     *
     * **Usage**
     *
     * ```js
     * test.describe.serial('group', () => {
     *   test('runs first', async ({ page }) => {});
     *   test('runs second', async ({ page }) => {});
     * });
     * ```
     *
     * @param title Group title.
     * @param callback A callback that is run immediately when calling
     * [test.describe.serial(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-serial). Any tests
     * added in this callback will belong to the group.
     */
    serial: SuiteFunction & {
        /**
         * **NOTE** See [test.describe.configure([options])](https://playwright.dev/docs/api/class-test#test-describe-configure) for
         * the preferred way of configuring the execution mode.
         *
         * Declares a focused group of tests that should always be run serially. If one of the tests fails, all subsequent
         * tests are skipped. All tests in a group are retried together. If there are some focused tests or suites, all of
         * them will be run but nothing else.
         *
         * **NOTE** Using serial is not recommended. It is usually better to make your tests isolated, so they can be run
         * independently.
         *
         * **Usage**
         *
         * ```js
         * test.describe.serial.only('group', () => {
         *   test('runs first', async ({ page }) => {
         *   });
         *   test('runs second', async ({ page }) => {
         *   });
         * });
         * ```
         *
         * @param title Group title.
         * @param callback A callback that is run immediately when calling
         * [test.describe.serial.only(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-serial-only).
         * Any tests added in this callback will belong to the group.
         */
        only: SuiteFunction;
    };
    /**
     * **NOTE** See [test.describe.configure([options])](https://playwright.dev/docs/api/class-test#test-describe-configure) for
     * the preferred way of configuring the execution mode.
     *
     * Declares a group of tests that could be run in parallel. By default, tests in a single test file run one after
     * another, but using
     * [test.describe.parallel(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-parallel) allows
     * them to run in parallel.
     *
     * **Usage**
     *
     * ```js
     * test.describe.parallel('group', () => {
     *   test('runs in parallel 1', async ({ page }) => {});
     *   test('runs in parallel 2', async ({ page }) => {});
     * });
     * ```
     *
     * Note that parallel tests are executed in separate processes and cannot share any state or global variables. Each of
     * the parallel tests executes all relevant hooks.
     * @param title Group title.
     * @param callback A callback that is run immediately when calling
     * [test.describe.parallel(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-parallel). Any
     * tests added in this callback will belong to the group.
     */
    parallel: SuiteFunction & {
        /**
         * **NOTE** See [test.describe.configure([options])](https://playwright.dev/docs/api/class-test#test-describe-configure) for
         * the preferred way of configuring the execution mode.
         *
         * Declares a focused group of tests that could be run in parallel. This is similar to
         * [test.describe.parallel(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-parallel), but
         * focuses the group. If there are some focused tests or suites, all of them will be run but nothing else.
         *
         * **Usage**
         *
         * ```js
         * test.describe.parallel.only('group', () => {
         *   test('runs in parallel 1', async ({ page }) => {});
         *   test('runs in parallel 2', async ({ page }) => {});
         * });
         * ```
         *
         * @param title Group title.
         * @param callback A callback that is run immediately when calling
         * [test.describe.parallel.only(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-parallel-only).
         * Any tests added in this callback will belong to the group.
         */
        only: SuiteFunction;
    };
    /**
     * Configures the enclosing scope. Can be executed either on the top level or inside a describe. Configuration applies
     * to the entire scope, regardless of whether it run before or after the test declaration.
     *
     * Learn more about the execution modes [here](https://playwright.dev/docs/test-parallel).
     *
     * **Usage**
     * - Running tests in parallel.
     *
     *   ```js
     *   // Run all the tests in the file concurrently using parallel workers.
     *   test.describe.configure({ mode: 'parallel' });
     *   test('runs in parallel 1', async ({ page }) => {});
     *   test('runs in parallel 2', async ({ page }) => {});
     *   ```
     *
     * - Running tests serially, retrying from the start.
     *
     *   **NOTE** Running serially is not recommended. It is usually better to make your tests isolated, so they can be
     *   run independently.
     *
     *   ```js
     *   // Annotate tests as inter-dependent.
     *   test.describe.configure({ mode: 'serial' });
     *   test('runs first', async ({ page }) => {});
     *   test('runs second', async ({ page }) => {});
     *   ```
     *
     * - Configuring retries and timeout for each test.
     *
     *   ```js
     *   // Each test in the file will be retried twice and have a timeout of 20 seconds.
     *   test.describe.configure({ retries: 2, timeout: 20_000 });
     *   test('runs first', async ({ page }) => {});
     *   test('runs second', async ({ page }) => {});
     *   ```
     *
     * - Run multiple describes in parallel, but tests inside each describe in order.
     *
     *   ```js
     *   test.describe.configure({ mode: 'parallel' });
     *
     *   test.describe('A, runs in parallel with B', () => {
     *     test.describe.configure({ mode: 'default' });
     *     test('in order A1', async ({ page }) => {});
     *     test('in order A2', async ({ page }) => {});
     *   });
     *
     *   test.describe('B, runs in parallel with A', () => {
     *     test.describe.configure({ mode: 'default' });
     *     test('in order B1', async ({ page }) => {});
     *     test('in order B2', async ({ page }) => {});
     *   });
     *   ```
     *
     * @param options
     */
    configure: (options: { mode?: 'default' | 'parallel' | 'serial', retries?: number, timeout?: number }) => void;
}
