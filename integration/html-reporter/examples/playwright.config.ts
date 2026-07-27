import { resolve } from 'node:path';

import { defineConfig } from '@playwright/test';
import type { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';

const examplesDirectory = __dirname;
const appDirectory = resolve(examplesDirectory, 'app');
const reportOutput = resolve(examplesDirectory, 'reports', 'single');

export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
    testDir: './specs',
    timeout: 10_000,
    retries: 0,
    workers: 1,
    reporter: [
        ['@serenity-js/playwright-test', {
            crew: [
                ['@serenity-js/html-reporter', {
                    outputDirectory: reportOutput,
                    specDirectory: resolve(__dirname, 'specs'),
                    title: 'Test Project',
                    testRunId: '42',
                    moduleId: 'html-reporter',
                    projectName: 'test-project',
                    ci: {
                        provider: 'GitHub Actions',
                        buildNumber: '42',
                        branch: 'main',
                        commit: 'abc1234',
                        commitMessage: 'fix: resolve flaky test',
                        commitAuthor: 'jan-molak',
                        jobUrl: 'https://github.com/serenity-js/serenity-js/actions/runs/12345',
                        repositoryUrl: 'https://github.com/serenity-js/serenity-js',
                    },
                }],
            ],
        }],
    ],
    use: {
        headless: true,
        baseURL: 'http://127.0.0.1:8090',
        defaultActorName: 'Tester',
        video: 'on',
        crew: [
            ['@serenity-js/web:Photographer', { strategy: 'TakePhotosOfInteractions' }],
        ],
    },
    webServer: {
        command: `npx http-server ${appDirectory} -p 8090 -c-1 --silent`,
        url: 'http://127.0.0.1:8090/index.html',
        reuseExistingServer: !process.env.CI,
        cwd: resolve(__dirname, '..'),
    },
    projects: [
        { name: 'chromium', use: { browserName: 'chromium' } },
    ],
});
