import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';
import { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

import { LiveEventsRecorder } from './src/LiveEventsRecorder';

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    testDir: './examples',
    timeout: 30_000,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,

    reporter: [
        [ 'line' ],
        [
            path.resolve(__dirname, '../../packages/playwright-test'),    // '@serenity-js/playwright-test'
            {
                liveEvents: true,
                crew: [
                    '@integration/testing-tools:ChildProcessReporter',
                    '@serenity-js/core:StreamReporter',
                    new LiveEventsRecorder(path.resolve(__dirname, 'target/live-events/receipts.json')),
                ],
            },
        ],
    ],

    use: {
        cueTimeout: 5_000,
        actionTimeout: 0,
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'default',
            use: {
                ...devices['Desktop Chrome'],
                crew: [
                    // disable Photographer
                ],
            },
        },
    ],
});
