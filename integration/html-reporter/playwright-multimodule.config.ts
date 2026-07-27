import { resolve } from 'node:path';

import { defineConfig } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

const integrationDirectory = __dirname;
const multimoduleReportOutput = resolve(integrationDirectory, 'examples-multimodule', 'reports', 'serenity');

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    testDir: './spec/tags',
    testMatch: '**/module-filtering.spec.ts',
    timeout: 30_000,
    retries: 0,
    workers: 3,
    reporter: [
        ['list'],
    ],
    use: {
        baseURL: `http://127.0.0.1:8091`,
        defaultActorName: 'Tester',
    },
    webServer: {
        command: `npx http-server ${multimoduleReportOutput} -p 8091 -c-1 --silent`,
        url: 'http://127.0.0.1:8091/index.html',
        reuseExistingServer: false,
        cwd: integrationDirectory,
    },
    projects: [
        { name: 'desktop', use: { viewport: { width: 1280, height: 720 } } },
        { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
        { name: 'mobile', use: { viewport: { width: 375, height: 667 } } },
    ],
});
