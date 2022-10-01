import { ChildProcessReporter } from '@integration/testing-tools';
import { devices } from '@playwright/test';
import { Duration, StreamReporter } from '@serenity-js/core';
import type { PlaywrightTestConfig } from '@serenity-js/playwright-test';
import * as path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    testDir: './examples',
    /* Maximum time one test can run for. */
    timeout: 30_000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 5000,
    },
    /* Run tests in files in parallel */
    // fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Disable retries since we're testing how failing tests are reported */
    retries: 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    // reporter: 'html',

    reporter: [
        [ 'line' ],
        // [ 'html', { open: 'never' }],
        [
            path.resolve(__dirname, '../../packages/playwright-test'),    // '@serenity-js/playwright-test'
            {
                cueTimeout: Duration.ofMilliseconds(500),
                crew: [
                    new ChildProcessReporter(),
                    new StreamReporter(),
                ],
            },
        ],
    ],

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        cueTimeout: Duration.ofSeconds(5),
        
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 0,
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://localhost:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
    ],

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    // outputDir: 'test-results/',
};

export default config;
