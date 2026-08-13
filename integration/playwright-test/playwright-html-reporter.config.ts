import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

/**
 * Playwright config used by html_reporter.spec.ts to verify that HtmlReporter
 * works correctly when configured as a crew member in a Playwright Test project.
 *
 * This differs from playwright.config.ts, which is used by the other integration
 * specs to test Serenity/JS Playwright Test adapter features (fixtures, events, etc.)
 * without the HtmlReporter in the crew.
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
