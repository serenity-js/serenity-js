import { defineConfig } from '@playwright/test';

export default defineConfig({
    tsconfig: './tsconfig.spec.json',
    testDir: './spec',
    timeout: 30_000,
    retries: 0,
    workers: 1,
    projects: [
        {
            name: 'unit',
            testMatch: ['**/*.spec.ts'],
            testIgnore: ['**/components/**'],
        },
        {
            name: 'components',
            testMatch: ['**/components/**/*.spec.ts'],
            use: { browserName: 'chromium', headless: true },
        },
    ],
});
