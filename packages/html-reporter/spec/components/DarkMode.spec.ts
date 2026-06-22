import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

test.describe('Dark mode', () => {

    test('FilterBar renders with dark theme', async ({ mount, page }) => {
        await mount({
            component: 'FilterBar',
            importPath: './components/FilterBar',
            props: { outcomes: { passed: 2, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, total: 3, activeFilter: 'all' },
            data: minimalData(),
        });

        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        await expect(page.locator('.filter-bar')).toBeVisible();
        // Verify dark mode CSS variables are applied (background changes)
        const bg = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--bg-surface'));
        expect(bg).toBeTruthy();
    });

    test('TagsView renders with dark theme', async ({ mount, page }) => {
        await mount({
            component: 'TagsView',
            importPath: './components/TagsView',
            props: { onNavigate: () => {} },
            data: minimalData({ tags: [{ type: 'feature', name: 'Login', scenarioCount: 2, passed: 2 }] }),
        });

        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        await expect(page.locator('.tag-card')).toBeVisible();
        await expect(page.locator('body')).toContainText('Login');
    });

    test('SystemContextView renders with dark theme', async ({ mount, page }) => {
        await mount({
            component: 'SystemContextView',
            importPath: './components/SystemContextView',
            data: minimalData(),
        });

        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        await expect(page.locator('.context-grid').first()).toBeVisible();
        await expect(page.locator('body')).toContainText('v22.0.0');
    });

    test('TimelineView renders with dark theme', async ({ mount, page }) => {
        await mount({
            component: 'TimelineView',
            importPath: './components/TimelineView',
            props: { onNavigate: () => {} },
            data: minimalData({
                scenarios: [
                    { name: 'Test A', category: 'Suite', outcome: 'SUCCESS', duration: 100, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
                ],
            }),
        });

        await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
        await expect(page.locator('.filter-bar')).toBeVisible();
        await expect(page.locator('body')).toContainText('Test A');
    });
});
