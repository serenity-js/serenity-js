import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

/**
 * Playwright config that includes the HtmlReporter in the crew.
 * Used by the html_reporter.spec.ts integration test.
 */
export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    testDir: './examples',
    timeout: 30_000,
    retries: 0,
    workers: 1,
    reporter: [
        [ 'line' ],
        [
            path.resolve(__dirname, '../../packages/playwright-test'),
            {
                crew: [
                    '@integration/testing-tools:ChildProcessReporter',
                    [ '@serenity-js/html-reporter:HtmlReporter', {
                        outputDirectory: path.resolve(__dirname, 'output/html-report'),
                    }],
                ],
            },
        ],
    ],
    use: {
        actionTimeout: 0,
        baseURL: 'http://localhost:3000',
    },
    projects: [
        {
            name: 'default',
            use: {
                ...devices['Desktop Chrome'],
                crew: [],
            },
        },
    ],
});
