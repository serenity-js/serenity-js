/**
 * Configuration options for the {@link HtmlReporter}.
 *
 * @group Stage
 */
export interface HtmlReporterConfig {
    /**
     * Report output directory.
     *
     * @default './reports/serenity-js'
     */
    outputDirectory?: string;

    /**
     * Root directory for deriving the capabilities hierarchy.
     */
    specDirectory?: string;

    /**
     * Custom title displayed in the report header.
     */
    title?: string;

    /**
     * Maximum number of test run directories to retain.
     * Older runs are deleted during aggregation.
     * When not specified, all historical runs are preserved.
     */
    maxHistory?: number;

    /**
     * Number of recent executions to consider for consistency analysis.
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
     * Defaults to GITHUB_RUN_NUMBER, CI_PIPELINE_IID, BUILD_NUMBER,
     * CIRCLE_BUILD_NUM, or the current ISO timestamp (in that order).
     * Override to ensure consistency across parallel CI jobs
     * contributing to the same test run.
     */
    testRunId?: string;

    /**
     * Identifier for the module (parallel CI job shard).
     * Used in the run directory name to prevent filesystem collisions
     * when multiple modules upload artifacts to the same CI artifact store.
     * Defaults to a timestamp suffix when not specified.
     */
    moduleId?: string;

    /**
     * Override CI/CD runtime context with explicit values.
     * When provided, auto-detection from environment variables is skipped.
     * Useful for testing or when the reporter runs outside of CI.
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
