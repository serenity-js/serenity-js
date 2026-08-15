/**
 * Used to configure the {@link HtmlReporter} Crew Member, which produces a self-contained
 * static HTML report with trend analysis, consistency classification, and living documentation.
 *
 * All properties are optional. When omitted, the reporter uses sensible defaults:
 * output goes to `./reports/serenity-js`, the project name is read from `package.json`,
 * the test run ID is detected from CI environment variables, and consistency analysis
 * considers the last 5 runs.
 *
 * ## Minimal configuration
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 *
 * configure({
 *   crew: [
 *     ['@serenity-js/html-reporter', {
 *       outputDirectory: './reports/serenity-js',
 *       title: 'Checkout Service — Acceptance Tests',
 *     }],
 *   ],
 * });
 * ```
 *
 * ## With capabilities hierarchy and history retention
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 *
 * configure({
 *   crew: [
 *     ['@serenity-js/html-reporter', {
 *       outputDirectory: './reports/serenity-js',
 *       specDirectory: './spec',
 *       title: 'My Project — Acceptance Tests',
 *       maxHistory: 20,
 *       consistencyWindow: 10,
 *     }],
 *   ],
 * });
 * ```
 *
 * ## With CI context override
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 *
 * configure({
 *   crew: [
 *     ['@serenity-js/html-reporter', {
 *       outputDirectory: './reports/serenity-js',
 *       testRunId: process.env.BUILD_ID,
 *       moduleId: 'api-tests',
 *       ci: {
 *         provider: 'Jenkins',
 *         buildNumber: process.env.BUILD_NUMBER,
 *         branch: process.env.GIT_BRANCH,
 *         commit: process.env.GIT_COMMIT,
 *         jobUrl: process.env.BUILD_URL,
 *       },
 *     }],
 *   ],
 * });
 * ```
 *
 * ## Programmatic registration
 *
 * ```ts
 * import { configure } from '@serenity-js/core';
 * import { HtmlReporter } from '@serenity-js/html-reporter';
 *
 * configure({
 *   crew: [
 *     HtmlReporter.fromJSON({
 *       outputDirectory: './reports/serenity-js',
 *       specDirectory: './spec',
 *     }),
 *   ],
 * });
 * ```
 *
 * ## Learn more
 *
 * - [Playwright Test configuration](https://serenity-js.org/handbook/test-runners/playwright-test/configuration/)
 * - [WebdriverIO configuration](https://serenity-js.org/handbook/test-runners/webdriverio/#configuration)
 * - [Cucumber configuration](https://serenity-js.org/handbook/test-runners/cucumber/#configuring-serenityjs)
 * - [Mocha configuration](https://serenity-js.org/handbook/test-runners/mocha/#configuring-serenityjs)
 * - [Jasmine configuration](https://serenity-js.org/handbook/test-runners/jasmine/#configuring-serenityjs)
 *
 * @group Stage
 */
export interface HtmlReporterConfig {
    /**
     * Path to the directory where the HTML report and test run data are written.
     *
     * @default './reports/serenity-js'
     */
    outputDirectory?: string;

    /**
     * Root directory of your test specifications.
     *
     * Enables the **Capabilities view** in the report — scenarios are grouped
     * into a hierarchy based on subdirectory structure relative to this path.
     * Additionally, any `README.md` files found in specification subdirectories
     * are rendered as living documentation alongside the corresponding capability node.
     *
     * When not specified, the Capabilities view is not generated.
     *
     * Learn more: [The requirements hierarchy](https://serenity-js.org/handbook/reporting/html-reporter/#the-requirements-hierarchy)
     */
    specDirectory?: string;

    /**
     * Custom title displayed in the report header.
     * When not specified, the report uses the project name.
     */
    title?: string;

    /**
     * Maximum number of test run directories to retain in the output.
     * Older runs are deleted during aggregation to limit disk usage.
     * When not specified, all historical runs are preserved.
     */
    maxHistory?: number;

    /**
     * Number of recent executions to consider when classifying
     * test consistency (flaky, degraded, recovered, inconsistent).
     *
     * @default 5
     */
    consistencyWindow?: number;

    /**
     * Custom project name displayed in the report.
     * When not specified, the name is read from the closest `package.json`.
     */
    projectName?: string;

    /**
     * Identifier for the test run directory.
     *
     * Defaults to `GITHUB_RUN_NUMBER`, `CI_PIPELINE_IID`, `BUILD_NUMBER`,
     * `CIRCLE_BUILD_NUM`, or the current ISO timestamp (in that order).
     *
     * Override this when parallel CI jobs contribute to the same test run
     * and upload artifacts to a shared store — all jobs must use the same
     * `testRunId` so their results are aggregated into a single run.
     */
    testRunId?: string;

    /**
     * Identifier for the module (parallel CI job shard).
     *
     * When multiple jobs share the same {@link testRunId}, each job needs
     * a unique `moduleId` to prevent filesystem collisions in the run directory.
     * For example, a pipeline with `api-tests`, `ui-tests`, and `e2e-tests`
     * shards would assign each a distinct `moduleId`.
     *
     * Defaults to a timestamp suffix when not specified.
     */
    moduleId?: string;

    /**
     * Override CI/CD runtime context with explicit values.
     *
     * When provided, auto-detection from environment variables is skipped entirely.
     * Useful for testing, local development, or when the reporter runs in a CI system
     * that is not auto-detected.
     *
     * Auto-detected providers (in priority order):
     * - **GitHub Actions** — detected via `GITHUB_ACTIONS`
     * - **GitLab CI** — detected via `GITLAB_CI`
     * - **Jenkins** — detected via `JENKINS_URL`
     * - **CircleCI** — detected via `CIRCLECI`
     *
     * When no CI provider is detected, the reporter falls back to local git metadata.
     */
    ci?: {
        provider?: string;
        buildNumber?: string;
        branch?: string;
        commit?: string;
        commitMessage?: string;
        commitAuthor?: string;
        jobUrl?: string;
        repositoryUrl?: string;
    };
}
