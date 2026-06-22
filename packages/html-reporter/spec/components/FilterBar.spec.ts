import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

test.describe('FilterBar', () => {

    test('renders filter chips with correct counts', async ({ mount, page }) => {
        await mount({
            component: 'FilterBar',
            importPath: './components/FilterBar',
            props: {
                outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                total: 4,
                activeFilter: 'all',
            },
            data: minimalData(),
        });

        await expect(page.locator('.filter-chip', { hasText: 'All' })).toContainText('4');
        await expect(page.locator('.filter-chip', { hasText: 'Passed' })).toContainText('3');
        await expect(page.locator('.filter-chip', { hasText: 'Failed' })).toContainText('1');
        await expect(page.locator('.filter-chip', { hasText: 'Skipped' })).toContainText('0');
    });

    test('marks the active filter chip', async ({ mount, page }) => {
        await mount({
            component: 'FilterBar',
            importPath: './components/FilterBar',
            props: {
                outcomes: { passed: 2, failed: 1, pending: 1, skipped: 0, compromised: 0, error: 0 },
                total: 4,
                activeFilter: 'failed',
            },
            data: minimalData(),
        });

        await expect(page.locator('.filter-chip.failed.active')).toBeVisible();
        await expect(page.locator('.filter-chip.all.active')).not.toBeVisible();
    });

    test('renders sort dropdown when sortOptions provided', async ({ mount, page }) => {
        await mount({
            component: 'FilterBar',
            importPath: './components/FilterBar',
            props: {
                outcomes: { passed: 3, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                total: 3,
                activeFilter: 'all',
                sortOptions: [{ key: 'name', label: 'Name' }, { key: 'duration', label: 'Duration' }],
                activeSort: 'name',
            },
            data: minimalData(),
        });

        await expect(page.locator('.sort-select')).toBeVisible();
        await expect(page.locator('.sort-select')).toHaveValue('name');
    });

    test('does not render sort dropdown when no sortOptions', async ({ mount, page }) => {
        await mount({
            component: 'FilterBar',
            importPath: './components/FilterBar',
            props: {
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                total: 1,
                activeFilter: 'all',
            },
            data: minimalData(),
        });

        await expect(page.locator('.sort-select')).not.toBeVisible();
    });
});
