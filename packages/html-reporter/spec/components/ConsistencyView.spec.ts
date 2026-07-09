import { minimalData } from './data-factories.js';
import { describe, expect, it } from './fixtures.js';

describe('ConsistencyView', () => {

    const inconsistentTestData = minimalData({
        inconsistentTests: [
            {
                name: 'Flaky test (never genuinely fails)',
                category: 'Suite A',
                source: { path: 'spec/flaky.spec.ts', line: 10 },
                tags: [{ type: 'feature', name: 'Checkout' }],
                inconsistencyRate: 0.5,
                history: ['SUCCESS', 'RETRIED_SUCCESS', 'RETRIED_SUCCESS'],
                labels: ['#1', '#2', '#3'],
            },
            {
                name: 'Inconsistent test (failed before, passes via retry)',
                category: 'Suite A',
                source: { path: 'spec/unstable.spec.ts', line: 20 },
                tags: [{ type: 'feature', name: 'Login' }],
                inconsistencyRate: 0.6,
                history: ['FAILURE', 'RETRIED_SUCCESS'],
                labels: ['#1', '#2'],
            },
            {
                name: 'Degraded test (was passing, now failing)',
                category: 'Suite B',
                source: { path: 'spec/broken.spec.ts', line: 5 },
                tags: [{ type: 'feature', name: 'Login' }],
                inconsistencyRate: 0.8,
                history: ['SUCCESS', 'FAILURE'],
                labels: ['#1', '#2'],
            },
            {
                name: 'Recovered test (was failing, now passes cleanly)',
                category: 'Suite B',
                source: { path: 'spec/fixed.spec.ts', line: 15 },
                tags: [{ type: 'feature', name: 'Checkout' }],
                inconsistencyRate: 0.3,
                history: ['FAILURE', 'SUCCESS'],
                labels: ['#1', '#2'],
            },
        ],
    });

    it('default filter is "all" showing all tests', async ({ mount, page }) => {
        await mount({
            component: 'ConsistencyView',
            importPath: './components/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
        });

        const allChip = page.locator('.filter-chip', { hasText: 'All' });
        await expect(allChip).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('body')).toContainText('Showing 4 tests');
    });

    it('displays four filter chips with correct counts', async ({ mount, page }) => {
        await mount({
            component: 'ConsistencyView',
            importPath: './components/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
        });

        await expect(page.locator('.filter-chip', { hasText: 'All' }).locator('.count')).toHaveText('4');
        await expect(page.locator('.filter-chip', { hasText: 'Flaky' }).locator('.count')).toHaveText('1');
        await expect(page.locator('.filter-chip', { hasText: 'Inconsistent' }).locator('.count')).toHaveText('1');
        await expect(page.locator('.filter-chip', { hasText: 'Degraded' }).locator('.count')).toHaveText('1');
        await expect(page.locator('.filter-chip', { hasText: 'Recovered' }).locator('.count')).toHaveText('1');
    });

    it('flaky filter shows only tests that never genuinely failed', async ({ mount, page }) => {
        await mount({
            component: 'ConsistencyView',
            importPath: './components/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
        });

        await page.locator('.filter-chip', { hasText: 'Flaky' }).click();
        await expect(page.locator('body')).toContainText('Showing 1 test');
        await expect(page.locator('body')).toContainText('Flaky test (never genuinely fails)');
        await expect(page.locator('body')).not.toContainText('Degraded test');
    });

    it('inconsistent filter excludes flaky-only tests', async ({ mount, page }) => {
        await mount({
            component: 'ConsistencyView',
            importPath: './components/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
        });

        await page.locator('.filter-chip', { hasText: /^Inconsistent/ }).click();
        await expect(page.locator('body')).toContainText('Showing 1 test');
        await expect(page.locator('body')).toContainText('Inconsistent test (failed before, passes via retry)');
        await expect(page.locator('body')).not.toContainText('Flaky test');
    });

    it('classifies [SUCCESS, FAILURE] as degraded', async ({ mount, page }) => {
        await mount({
            component: 'ConsistencyView',
            importPath: './components/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
        });

        await page.locator('.filter-chip', { hasText: 'Degraded' }).click();
        await expect(page.locator('body')).toContainText('Degraded test (was passing, now failing)');
    });

    it('classifies [FAILURE, SUCCESS] as recovered (clean pass)', async ({ mount, page }) => {
        await mount({
            component: 'ConsistencyView',
            importPath: './components/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
        });

        await page.locator('.filter-chip', { hasText: 'Recovered' }).click();
        await expect(page.locator('body')).toContainText('Recovered test (was failing, now passes cleanly)');
    });

    it('classifies [FAILURE, RETRIED_SUCCESS] as inconsistent, not flaky', async ({ mount, page }) => {
        await mount({
            component: 'ConsistencyView',
            importPath: './components/ConsistencyView',
            props: { onNavigate: () => {} },
            data: minimalData({
                inconsistentTests: [
                    {
                        name: 'Was failing now retried',
                        category: 'Suite',
                        source: { path: 'spec/test.spec.ts', line: 1 },
                        tags: [],
                        inconsistencyRate: 0.5,
                        history: ['FAILURE', 'RETRIED_SUCCESS'],
                        labels: ['#1', '#2'],
                    },
                ],
            }),
        });

        // Should NOT be flaky (has genuine failure in history)
        await expect(page.locator('.filter-chip', { hasText: 'Flaky' }).locator('.count')).toHaveText('0');
        await expect(page.locator('.filter-chip', { hasText: /^Inconsistent/ }).locator('.count')).toHaveText('1');
    });

    it('shows kind label on each row', async ({ mount, page }) => {
        await mount({
            component: 'ConsistencyView',
            importPath: './components/ConsistencyView',
            props: { onNavigate: () => {} },
            data: inconsistentTestData,
        });

        const kindLabels = page.locator('.status-item-kind');
        await expect(kindLabels).toHaveCount(4);
    });

    it('shows placeholder when no inconsistent tests', async ({ mount, page }) => {
        await mount({
            component: 'ConsistencyView',
            importPath: './components/ConsistencyView',
            props: { onNavigate: () => {} },
            data: minimalData({ inconsistentTests: [] }),
        });

        await expect(page.locator('body')).toContainText('All Tests Consistent');
    });
});
