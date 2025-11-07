import { defineConfig } from '@playwright/test';

import type { TestOptions } from './src/mcp-api.js';

export default defineConfig<TestOptions>({
    testDir: './spec',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'list',
    projects: [
        // { name: 'msedge', use: { mcpBrowser: 'msedge' } },
        { name: 'chromium', use: { mcpBrowser: 'chromium' } },
        // { name: 'firefox', use: { mcpBrowser: 'firefox' } },
        // { name: 'webkit', use: { mcpBrowser: 'webkit' } },
    ],
});
