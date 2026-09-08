import { defineConfig } from '@playwright/test';

const galleryUrl = 'http://localhost:3200/playwright/gallery/index.html';

export default defineConfig({
    tsconfig: './tsconfig.spec.json',
    timeout: 30_000,
    retries: 0,
    projects: [
        {
            name: 'unit',
            testDir: './spec',
            testMatch: ['**/*.spec.ts'],
        },
        {
            name: 'components',
            testDir: './app/components',
            testMatch: ['**/*.spec.ts'],
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
