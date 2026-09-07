import { defineConfig } from '@playwright/test';

const galleryUrl = 'http://localhost:3200/playwright/gallery/index.html';

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
            testIgnore: ['**/app/**/*.story.spec.ts'],
            use: { browserName: 'chromium', headless: true },
        },
        {
            name: 'stories',
            testMatch: ['**/app/**/*.story.spec.ts'],
            use: {
                browserName: 'chromium',
                headless: true,
                baseURL: galleryUrl,
                serviceWorkers: 'block',
                reuseContext: true,
            },
        },
    ],
    webServer: {
        command: 'npx vite --port 3200 --strictPort',
        url: galleryUrl,
        reuseExistingServer: !process.env.CI,
    },
});
