import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './spec',
    timeout: 30_000,
    retries: 0,
    workers: 1,
    use: {
        headless: true,
        baseURL: 'http://127.0.0.1:8080',
    },
    webServer: {
        command: 'npx http-server report -p 8080 -c-1',
        url: 'http://127.0.0.1:8080/index.html',
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        { name: 'chromium', use: { browserName: 'chromium' } },
    ],
});
