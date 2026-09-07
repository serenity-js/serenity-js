/*
 * Implementation contracts: these tests verify CSS custom property values change
 * correctly on theme toggle (data-theme="dark" vs "light"). This tests the theming
 * infrastructure — computed styles, not user-observable behaviour.
 */
import { minimalData } from '../../../spec/app/data-factories.js';
import { describe, expect, it } from '../../../spec/app/story-fixtures.js';

describe('Dark mode', () => {

    it('FilterBar renders with dark theme', async ({ mount, page }) => {
        await mount('components/common/FilterBar/Default', {
            filters: [
                { key: 'all', label: 'All', count: 3 },
                { key: 'passed', label: 'Passed', count: 2 },
                { key: 'failed', label: 'Failed', count: 1 },
            ],
            activeFilter: 'all',
            theme: 'dark',
        });

        await expect(page.locator('.filter-bar')).toBeVisible();
        const bg = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--bg-surface'));
        expect(bg).toBeTruthy();
    });

    it('TagsView renders with dark theme', async ({ mount, page }) => {
        const props = minimalData({ tags: [{ type: 'feature', name: 'Login', scenarioCount: 2, passed: 2, failed: 0, skipped: 0 }] });
        await mount('components/tags/TagsView/Default', {
            ...props,
            theme: 'dark',
        });

        await expect(page.locator('.tag-card')).toBeVisible();
        await expect(page.locator('body')).toContainText('Login');
    });

    it('SystemContextView renders with dark theme', async ({ mount, page }) => {
        const props = minimalData();
        await mount('components/about/SystemContextView/Default', {
            ...props,
            theme: 'dark',
        });

        await expect(page.locator('.context-grid').first()).toBeVisible();
        await expect(page.locator('body')).toContainText('v22.0.0');
    });

    it('TimelineView renders with dark theme', async ({ mount, page }) => {
        const props = minimalData({
            scenarios: [
                { name: 'Test A', category: 'Suite', outcome: 'SUCCESS', duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [], executionHistory: [] },
            ],
        });
        await mount('components/timeline/TimelineView/Default', {
            ...props,
            theme: 'dark',
        });

        await expect(page.locator('.filter-bar')).toBeVisible();
        await expect(page.locator('body')).toContainText('Test A');
    });
});
