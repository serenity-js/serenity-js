import { defineConfig } from '@playwright/test';

export default defineConfig({
    tsconfig: './tsconfig.spec.json',
    testDir: './spec',
    timeout: 30_000,
    retries: 0,
    projects: [
        {
            name: 'unit',
            testMatch: ['**/*.spec.ts'],
            testIgnore: ['**/app/**'],
        },
        {
            name: 'components',
            testMatch: ['**/app/**/*.spec.ts'],
            use: { browserName: 'chromium', headless: true },
        },
    ],
});
