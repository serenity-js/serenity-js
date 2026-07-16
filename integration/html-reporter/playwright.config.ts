import { resolve } from 'node:path';

import { defineConfig } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

const reportOutput = resolve(__dirname, 'target', 'html-report');

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    testDir: './spec',
    timeout: 30_000,
    retries: 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        [ 'line' ],
        [ '@serenity-js/playwright-test', {
            crew: [
                [ '@serenity-js/html-reporter:HtmlReporter', {
                    outputDirectory: reportOutput,
                    specDirectory: resolve(__dirname, 'spec'),
                    title: 'HTML Reporter Journey Tests',
                } ],
            ],
        } ],
    ],
    use: {
        headless: true,
        baseURL: 'http://127.0.0.1:8080/index.html',
        defaultActorName: 'Serena',
    },
    webServer: {
        command: 'npx http-server examples/reports/serenity -p 8080 -c-1',
        url: 'http://127.0.0.1:8080/index.html',
        reuseExistingServer: ! process.env.CI,
    },
    projects: [
        { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1920, height: 1080 } } },
        { name: 'tablet', use: { browserName: 'chromium', viewport: { width: 1024, height: 768 } } },
        { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
    ],
});
