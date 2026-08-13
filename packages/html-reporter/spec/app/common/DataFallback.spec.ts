/**
 * Data loading error fallback UI.
 * Tests that the boot() function in app.tsx renders a user-friendly error
 * when report data is missing or malformed.
 *
 * These tests construct a raw HTML page (mimicking the real index.html structure)
 * rather than using the component test fixture, because the boot error path lives
 * in app.tsx — not in a mountable component.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';
import { buildSync } from 'esbuild';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, '../../../app');
const PACKAGE_ROOT = resolve(__dirname, '../../..');
const STYLES = readFileSync(resolve(TEMPLATE_DIR, 'styles.css'), 'utf8');

function buildAppBundle(): string {
    const result = buildSync({
        entryPoints: [resolve(TEMPLATE_DIR, 'app.tsx')],
        bundle: true,
        write: false,
        format: 'iife',
        target: 'es2020',
        nodePaths: [resolve(PACKAGE_ROOT, 'node_modules')],
    });
    return new TextDecoder().decode(result.outputFiles[0].contents);
}

const appJs = buildAppBundle();

test.describe('Boot error fallback (DATA-2)', () => {

    test('renders error UI when __SERENITY_REPORT_DATA__ is not set', async ({ page }) => {
        const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><style>${STYLES}</style></head>
<body><div id="app"></div>
<script>${appJs}</script>
</body></html>`;

        await page.route('**/boot-test.html', route => route.fulfill({ contentType: 'text/html', body: html }));
        await page.goto('http://localhost/boot-test.html', { waitUntil: 'load' });

        // Wait for async boot() to complete
        await page.waitForSelector('.data-error', { timeout: 5000 });

        const heading = page.locator('.data-error h1');
        await expect(heading).toContainText('Unable to Load Report');

        const message = page.locator('.data-error p').first();
        await expect(message).toContainText('Report data not found');
    });

    test('renders error UI when summary field is missing', async ({ page }) => {
        const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><style>${STYLES}</style></head>
<body><div id="app"></div>
<script>window.__SERENITY_REPORT_DATA__ = { scenarios: [] };</script>
<script>${appJs}</script>
</body></html>`;

        await page.route('**/boot-test.html', route => route.fulfill({ contentType: 'text/html', body: html }));
        await page.goto('http://localhost/boot-test.html', { waitUntil: 'load' });

        await page.waitForSelector('.data-error', { timeout: 5000 });

        const message = page.locator('.data-error p').first();
        await expect(message).toContainText('summary');
    });

    test('renders error UI when scenarios field is missing', async ({ page }) => {
        const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><style>${STYLES}</style></head>
<body><div id="app"></div>
<script>window.__SERENITY_REPORT_DATA__ = { summary: { title: 'Test', totalScenarios: 0, outcomes: {} } };</script>
<script>${appJs}</script>
</body></html>`;

        await page.route('**/boot-test.html', route => route.fulfill({ contentType: 'text/html', body: html }));
        await page.goto('http://localhost/boot-test.html', { waitUntil: 'load' });

        await page.waitForSelector('.data-error', { timeout: 5000 });

        const message = page.locator('.data-error p').first();
        await expect(message).toContainText('scenarios');
    });
});
