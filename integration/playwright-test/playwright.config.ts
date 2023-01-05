import { ChildProcessReporter } from '@integration/testing-tools';
import { devices } from '@playwright/test';
import { StreamReporter } from '@serenity-js/core';
import { PlaywrightTestConfig } from '@serenity-js/playwright-test';
import * as path from 'path';

import { ActorsWithLocalServer } from './examples/screenplay/actors/ActorsWithLocalServer';
import { CustomCast } from './examples/screenplay/actors/CustomCast';

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
                crew: [
                    new ChildProcessReporter(),
                    new StreamReporter(),
                ],
            },
        ],
    ],

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        cueTimeout: 5_000,
        actionTimeout: 0,
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://localhost:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'default',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'screenplay-local-server',
            use: {
                ...devices['Desktop Chrome'],
                actors: ({ browser, contextOptions }, use) => {
                    use(new ActorsWithLocalServer(browser, contextOptions));
                },
                defaultActorName: 'Phoebe',
            },
        },
        {
            name: 'screenplay-custom-cast',
            use: {
                ...devices['Desktop Chrome'],
                contextOptions: {
                    defaultNavigationTimeout: 30_000,
                    defaultNavigationWaitUntil: 'networkidle'
                },
                actors: ({ browser, contextOptions }, use) => {
                    use(CustomCast({
                        contextOptions, options: {
                            apiUrl: 'https://api.example.org',
                        },
                    }));
                },
            },
        },
        {
            name: 'screenplay-photographer-default',
            use: {
                ...devices['Desktop Chrome'],
                actors: ({ browser, contextOptions }, use) => {
                    use(new ActorsWithLocalServer(browser, contextOptions));
                },
                defaultActorName: 'Phoebe',
            },
        },
        {
            name: 'screenplay-photographer-strategy',
            use: {
                ...devices['Desktop Chrome'],
                crew: [
                    [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfInteractions' } ]
                ],
                actors: ({ browser, contextOptions }, use) => {
                    use(new ActorsWithLocalServer(browser, contextOptions));
                },
                defaultActorName: 'Phoebe'
            },
        },
    ],

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    // outputDir: 'test-results/',
};

export default config;
