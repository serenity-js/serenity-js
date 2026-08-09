import { expect, test } from '@playwright/test';
import { buildSync } from 'esbuild';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, '../../../../../app');
const PACKAGE_ROOT = resolve(__dirname, '../../../../..');
const STYLES = readFileSync(resolve(TEMPLATE_DIR, 'styles.css'), 'utf8');

/**
 * These tests verify the presentational output of TrendChartDetails.
 * They use raw Playwright because the component requires a Preact Ref prop
 * that cannot be serialised through the standard mount fixture.
 */
test.describe('TrendChartDetails', () => {

    function buildPage(selectedRun: Record<string, unknown>): string {
        const entryCode = [
            `import htm from 'htm';`,
            `import { h, render, createRef } from 'preact';`,
            `import { TrendChartDetails } from './components/common/charts/TrendChartDetails';`,
            `const html = htm.bind(h);`,
            `const panelRef = createRef();`,
            `const selectedRun = ${JSON.stringify(selectedRun)};`,
            `const onClose = () => {};`,
            `const onNavigate = () => {};`,
            `render(html\`<\${TrendChartDetails} selectedRun=\${selectedRun} panelRef=\${panelRef} onClose=\${onClose} onNavigate=\${onNavigate} />\`, document.getElementById('app'));`,
        ].join('\n');

        const result = buildSync({
            stdin: { contents: entryCode, resolveDir: TEMPLATE_DIR, loader: 'ts' },
            bundle: true,
            write: false,
            format: 'iife',
            target: 'es2020',
            nodePaths: [resolve(PACKAGE_ROOT, 'node_modules')],
        });

        const appJs = new TextDecoder().decode(result.outputFiles[0].contents);

        return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head><meta charset="UTF-8"><style>${STYLES}</style></head>
<body>
  <div id="app"></div>
  <script>${appJs}</script>
</body>
</html>`;
    }

    const singleModuleRun = {
        runId: '2024-06-15T14:30:00.000Z',
        index: 0,
        label: '8424 — 7 Aug 2026 20:13',
        timestamp: '7 Aug 2026 20:13',
        metrics: {
            passed: 3563,
            failed: 0,
            skipped: 85,
            fastest: '1ms',
            slowest: '16.1s',
            average: '422ms',
            total: '5m 10s',
        },
        // No modules or single module → triggers single-module layout
    };

    const multiModuleRun = {
        runId: '2024-06-15T14:30:00.000Z',
        index: 0,
        label: '8423 — 7 Aug 2026 19:36',
        timestamp: '7 Aug 2026 19:36',
        metrics: {
            passed: 3563,
            failed: 0,
            skipped: 85,
            fastest: '1ms',
            slowest: '28.7s',
            average: '443ms',
            total: '5m 46s',
        },
        modules: [
            { moduleId: 'cucumber-1', startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:31:00.000Z', outcome: 'passed', outcomes: { passed: 20, failed: 0, pending: 10, skipped: 0, compromised: 0, error: 0 } },
            { moduleId: 'playwright-web', startedAt: '2024-06-15T14:31:00.000Z', finishedAt: '2024-06-15T14:33:00.000Z', outcome: 'passed', outcomes: { passed: 551, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 } },
        ],
    };

    test.describe('single-module run details', () => {

        test('displays Duration metric alongside Total, Passed, Failed, and Skipped', async ({ page }) => {
            const html = buildPage(singleModuleRun);
            await page.route('**/test.html', route => route.fulfill({ contentType: 'text/html', body: html }));
            await page.goto('http://localhost/test.html', { waitUntil: 'load' });

            const metrics = page.locator('.run-details-metrics .run-details-metric');
            await expect(metrics).toHaveCount(5);

            const labels = metrics.locator('.run-details-metric-label');
            await expect(labels.nth(0)).toHaveText('Total');
            await expect(labels.nth(1)).toHaveText('Passed');
            await expect(labels.nth(2)).toHaveText('Failed');
            await expect(labels.nth(3)).toHaveText('Skipped');
            await expect(labels.nth(4)).toHaveText('Duration');
        });

        test('displays the formatted total duration value', async ({ page }) => {
            const html = buildPage(singleModuleRun);
            await page.route('**/test.html', route => route.fulfill({ contentType: 'text/html', body: html }));
            await page.goto('http://localhost/test.html', { waitUntil: 'load' });

            const durationMetric = page.locator('.run-details-metrics .run-details-metric').nth(4);
            const value = durationMetric.locator('.run-details-metric-value');
            await expect(value).toHaveText('5m 10s');
        });
    });

    test.describe('multi-module run details', () => {

        test('does not display the metrics row (shows module table instead)', async ({ page }) => {
            const html = buildPage(multiModuleRun);
            await page.route('**/test.html', route => route.fulfill({ contentType: 'text/html', body: html }));
            await page.goto('http://localhost/test.html', { waitUntil: 'load' });

            const metrics = page.locator('.run-details-metrics');
            await expect(metrics).toHaveCount(0);

            // Module table should be visible instead
            const table = page.locator('.run-details-table');
            await expect(table).toBeVisible();
        });
    });
});
