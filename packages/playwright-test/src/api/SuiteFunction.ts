// Playwright Test doesn't export all its public APIs, hence the need for this workaround
// See https://github.com/microsoft/playwright/pull/24146
export interface SuiteFunction {
    /**
     * Declares a group of tests.
     *
     * **Usage**
     *
     * ```js
     * test.describe('two tests', () => {
     *   test('one', async ({ page }) => {
     *     // ...
     *   });
     *
     *   test('two', async ({ page }) => {
     *     // ...
     *   });
     * });
     * ```
     *
     * @param title Group title.
     * @param callback A callback that is run immediately when calling
     * [test.describe(title, callback)](https://playwright.dev/docs/api/class-test#test-describe-1). Any tests added in
     * this callback will belong to the group.
     */
    (title: string, callback: () => void): void;
    /**
     * Declares an anonymous group of tests. This is convenient to give a group of tests a common option with
     * [test.use(options)](https://playwright.dev/docs/api/class-test#test-use).
     *
     * **Usage**
     *
     * ```js
     * test.describe(() => {
     *   test.use({ colorScheme: 'dark' });
     *
     *   test('one', async ({ page }) => {
     *     // ...
     *   });
     *
     *   test('two', async ({ page }) => {
     *     // ...
     *   });
     * });
     * ```
     *
     * @param callback A callback that is run immediately when calling
     * [test.describe(callback)](https://playwright.dev/docs/api/class-test#test-describe-2). Any tests added in this
     * callback will belong to the group.
     */
    (callback: () => void): void;
}
