import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

test.describe('TimelineView', () => {

    const data = minimalData({
        scenarios: [
            { name: 'Fast test', category: 'Suite', outcome: 'SUCCESS', duration: 50, startedAt: '2024-06-15T14:30:00.000Z', source: { path: 'a.spec.ts', line: 1 }, tags: [], activities: [] },
            { name: 'Medium test', category: 'Suite', outcome: 'SUCCESS', duration: 300, startedAt: '2024-06-15T14:30:00.050Z', source: { path: 'a.spec.ts', line: 5 }, tags: [], activities: [] },
            { name: 'Slow failing test', category: 'Other', outcome: 'FAILURE', duration: 800, startedAt: '2024-06-15T14:30:00.350Z', source: { path: 'b.spec.ts', line: 1 }, tags: [], activities: [], error: { name: 'Error', message: 'fail', stack: '' } },
        ],
        summary: {
            title: 'Test Project',
            totalScenarios: 3,
            outcomes: { passed: 2, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
            startedAt: '2024-06-15T14:30:00.000Z',
            finishedAt: '2024-06-15T14:30:01.150Z',
            duration: 1150,
            testRunner: 'Playwright',
        },
    });

    test('displays duration stats cards', async ({ mount, page }) => {
        await mount({
            component: 'TimelineView',
            importPath: './components/TimelineView',
            props: { onNavigate: () => {} },
            data,
        });

        await expect(page.locator('body')).toContainText('Slowest');
        await expect(page.locator('body')).toContainText('Fastest');
        await expect(page.locator('body')).toContainText('Average');
        await expect(page.locator('body')).toContainText('Total:');
    });

    test('renders timeline rows for each scenario', async ({ mount, page }) => {
        await mount({
            component: 'TimelineView',
            importPath: './components/TimelineView',
            props: { onNavigate: () => {} },
            data,
        });

        await expect(page.locator('body')).toContainText('Fast test');
        await expect(page.locator('body')).toContainText('Medium test');
        await expect(page.locator('body')).toContainText('Slow failing test');
    });

    test('renders filter bar with outcome chips', async ({ mount, page }) => {
        await mount({
            component: 'TimelineView',
            importPath: './components/TimelineView',
            props: { onNavigate: () => {} },
            data,
        });

        await expect(page.locator('.filter-bar')).toBeVisible();
        await expect(page.locator('.filter-chip', { hasText: 'All' })).toBeVisible();
        await expect(page.locator('.filter-chip', { hasText: 'Passed' })).toBeVisible();
    });

    test('filters by outcome when chip clicked', async ({ mount, page }) => {
        await mount({
            component: 'TimelineView',
            importPath: './components/TimelineView',
            props: { onNavigate: () => {} },
            data,
        });

        await page.locator('.filter-chip', { hasText: 'Failed' }).click();

        // Only the failing test should be visible
        await expect(page.locator('body')).toContainText('Slow failing test');
        await expect(page.locator('body')).not.toContainText('Fast test');
    });

    test('sorts by duration when sort option changed', async ({ mount, page }) => {
        await mount({
            component: 'TimelineView',
            importPath: './components/TimelineView',
            props: { onNavigate: () => {} },
            data,
        });

        await page.locator('.sort-select').selectOption('duration');

        // After sorting by duration, the slowest test should appear first in the virtual list
        await expect(page.locator('.timeline-row').first()).toContainText('Slow failing test');
    });
});
