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
     * Root directory for deriving the requirements hierarchy.
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
     * Number of recent executions to consider for stability analysis.
     *
     * @default 5
     */
    stabilityWindow?: number;

    /**
     * Custom project name displayed in the report.
     * When not specified, the name is read from the closest `package.json`.
     */
    projectName?: string;
}
