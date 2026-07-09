import { minimalData } from './data-factories.js';
import { describe, expect, it } from './fixtures.js';

describe('SegmentedBar', () => {

    it('renders nothing when all outcomes are zero', async ({ mount, page }) => {
        await mount({
            component: 'SegmentedBar',
            importPath: './components/charts/SegmentedBar',
            props: { outcomes: { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 } },
            data: minimalData(),
        });

        await expect(page.locator('[role="img"]')).toHaveCount(0);
    });

    it('renders a bar with correct aria-label describing the outcome counts', async ({ mount, page }) => {
        await mount({
            component: 'SegmentedBar',
            importPath: './components/charts/SegmentedBar',
            props: { outcomes: { passed: 5, failed: 2, pending: 1, skipped: 0, compromised: 0, error: 0 } },
            data: minimalData(),
        });

        const bar = page.locator('[role="img"]');
        await expect(bar).toBeVisible();
        await expect(bar).toHaveAttribute('aria-label', '5 passed, 2 failed, 1 skipped');
    });

    it('combines failed, error, and compromised into one failure segment', async ({ mount, page }) => {
        await mount({
            component: 'SegmentedBar',
            importPath: './components/charts/SegmentedBar',
            props: { outcomes: { passed: 4, failed: 1, pending: 0, skipped: 0, compromised: 1, error: 1 } },
            data: minimalData(),
        });

        const bar = page.locator('[role="img"]');
        // 4 passed + 3 failed (1+1+1) = 7 total
        await expect(bar).toHaveAttribute('aria-label', '4 passed, 3 failed, 0 skipped');
    });

    it('combines pending and skipped into one skipped segment', async ({ mount, page }) => {
        await mount({
            component: 'SegmentedBar',
            importPath: './components/charts/SegmentedBar',
            props: { outcomes: { passed: 2, failed: 0, pending: 3, skipped: 1, compromised: 0, error: 0 } },
            data: minimalData(),
        });

        const bar = page.locator('[role="img"]');
        await expect(bar).toHaveAttribute('aria-label', '2 passed, 0 failed, 4 skipped');
    });

    it('shows only a passed segment when there are no failures or skips', async ({ mount, page }) => {
        await mount({
            component: 'SegmentedBar',
            importPath: './components/charts/SegmentedBar',
            props: { outcomes: { passed: 10, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 } },
            data: minimalData(),
        });

        const bar = page.locator('[role="img"]');
        await expect(bar).toBeVisible();
        // Only one inner segment (the passed one)
        const segments = bar.locator('[aria-hidden="true"]');
        await expect(segments).toHaveCount(1);
        await expect(segments.first()).toHaveCSS('background-color', 'rgb(40, 199, 111)'); // --color-passed
    });

    it('uses default 6px height without a className', async ({ mount, page }) => {
        await mount({
            component: 'SegmentedBar',
            importPath: './components/charts/SegmentedBar',
            props: { outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 } },
            data: minimalData(),
        });

        const bar = page.locator('[role="img"]');
        await expect(bar).toHaveCSS('height', '6px');
    });

    it('uses 10px height when className is req-detail-outcome-bar', async ({ mount, page }) => {
        await mount({
            component: 'SegmentedBar',
            importPath: './components/charts/SegmentedBar',
            props: { outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, className: 'req-detail-outcome-bar' },
            data: minimalData(),
        });

        const bar = page.locator('[role="img"]');
        await expect(bar).toHaveCSS('height', '10px');
    });

    it('renders proportional segment widths', async ({ mount, page }) => {
        await mount({
            component: 'SegmentedBar',
            importPath: './components/charts/SegmentedBar',
            props: { outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 } },
            data: minimalData(),
        });

        const bar = page.locator('[role="img"]');
        const segments = bar.locator('[aria-hidden="true"]');
        await expect(segments).toHaveCount(2);
        // 3 passed out of 4 total = 75%
        await expect(segments.first()).toHaveAttribute('style', /width:\s*75%/);
        // 1 failed out of 4 total = 25%
        await expect(segments.nth(1)).toHaveAttribute('style', /width:\s*25%/);
    });

    it('includes a visually-hidden text summary for screen readers', async ({ mount, page }) => {
        await mount({
            component: 'SegmentedBar',
            importPath: './components/charts/SegmentedBar',
            props: { outcomes: { passed: 5, failed: 2, pending: 1, skipped: 0, compromised: 0, error: 0 } },
            data: minimalData(),
        });

        const hidden = page.locator('.visually-hidden');
        await expect(hidden).toHaveText('5 passed, 2 failed, 1 skipped');
    });
});
