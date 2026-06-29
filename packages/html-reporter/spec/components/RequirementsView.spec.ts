import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

function requirementsData() {
    return minimalData({
        requirements: {
            name: 'spec',
            type: 'directory',
            outcomes: { passed: 5, failed: 1, pending: 1, skipped: 0, compromised: 0, error: 0 },
            readme: '<h2>Feature Overview</h2><p>This is the project documentation.</p>',
            children: [
                {
                    name: 'passing-feature',
                    type: 'directory',
                    outcomes: { passed: 3, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                    readme: '<p>Passing feature docs</p>',
                    children: [
                        { name: 'login.spec.ts', type: 'file', outcomes: { passed: 3, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarios: [{ name: 'A', outcome: 'SUCCESS' }, { name: 'B', outcome: 'SUCCESS' }, { name: 'C', outcome: 'SUCCESS' }] },
                    ],
                },
                {
                    name: 'failing-feature',
                    type: 'directory',
                    outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                    children: [
                        { name: 'checkout.spec.ts', type: 'file', outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, scenarios: [{ name: 'D', outcome: 'SUCCESS' }, { name: 'E', outcome: 'FAILURE' }] },
                    ],
                },
                {
                    name: 'pending-feature',
                    type: 'directory',
                    outcomes: { passed: 1, failed: 0, pending: 1, skipped: 0, compromised: 0, error: 0 },
                    children: [
                        { name: 'search.spec.ts', type: 'file', outcomes: { passed: 1, failed: 0, pending: 1, skipped: 0, compromised: 0, error: 0 }, scenarios: [{ name: 'F', outcome: 'SUCCESS' }, { name: 'G', outcome: 'PENDING' }] },
                    ],
                },
            ],
        },
    });
}

test.describe('RequirementsView', () => {

    test.describe('detail panel — documentation-first', () => {

        test('shows README prominently (not collapsible, not hidden)', async ({ mount, page }) => {
            await mount({
                component: 'RequirementsView',
                importPath: './components/RequirementsView',
                data: requirementsData(),
                props: { onNavigate: () => undefined, route: '#/requirements' },
            });

            // README should be visible without any interaction
            const detail = page.locator('.req-detail-panel');
            await expect(detail.locator('.readme-content')).toBeVisible();
            await expect(detail.locator('.readme-content')).toContainText('project documentation');
            // Should NOT be inside a collapsible details/summary element
            await expect(detail.locator('details .readme-content')).toHaveCount(0);
        });

        test('reading order: title, health header, outcome bar, README, test files', async ({ mount, page }) => {
            await mount({
                component: 'RequirementsView',
                importPath: './components/RequirementsView',
                data: requirementsData(),
                props: { onNavigate: () => undefined, route: '#/requirements' },
            });

            await page.locator('.req-tree-node', { hasText: 'passing-feature' }).click();

            const detail = page.locator('.req-detail-panel');
            // Title comes first
            await expect(detail.locator('.req-detail-title').first()).toBeVisible();
            // Detail header (confidence + metrics) comes before README
            await expect(detail.locator('.req-detail-header')).toBeVisible();
            // README is present and visible
            await expect(detail.locator('.readme-content')).toContainText('Passing feature docs');
        });
    });

    test.describe('left panel — navigation', () => {

        test('search field is inside the left panel, above the tree', async ({ mount, page }) => {
            await mount({
                component: 'RequirementsView',
                importPath: './components/RequirementsView',
                data: requirementsData(),
                props: { onNavigate: () => undefined, route: '#/requirements' },
            });

            const leftPanel = page.locator('.req-tree-panel');
            await expect(leftPanel.locator('input[type="text"]')).toBeVisible();
        });

        test('filter bar uses the shared filter-bar styling with confidence categories', async ({ mount, page }) => {
            await mount({
                component: 'RequirementsView',
                importPath: './components/RequirementsView',
                data: requirementsData(),
                props: { onNavigate: () => undefined, route: '#/requirements' },
            });

            const leftPanel = page.locator('.req-tree-panel');
            const filterBar = leftPanel.locator('.filter-bar');
            await expect(filterBar).toBeVisible();
            await expect(filterBar).toContainText('Healthy');
            await expect(filterBar).toContainText('At Risk');
            await expect(filterBar).toContainText('Critical');
            await expect(filterBar).toContainText('Gaps');
        });
    });

    test.describe('detail header — single source of truth', () => {

        test('shows confidence prominently in the detail panel header', async ({ mount, page }) => {
            await mount({
                component: 'RequirementsView',
                importPath: './components/RequirementsView',
                data: requirementsData(),
                props: { onNavigate: () => undefined, route: '#/requirements' },
            });

            const header = page.locator('.req-detail-header');
            await expect(header).toBeVisible();
            await expect(header.locator('.req-detail-confidence')).toContainText('%');
            await expect(header.locator('.req-detail-confidence-label')).toContainText('confidence');
        });
    });

    test('shows empty state when requirements data is missing', async ({ mount, page }) => {
        await mount({
            component: 'RequirementsView',
            importPath: './components/RequirementsView',
            data: minimalData({ requirements: null }),
            props: { onNavigate: () => undefined, route: '#/requirements' },
        });

        await expect(page.locator('.empty-state')).toBeVisible();
        await expect(page.locator('body')).toContainText('specDirectory');
    });
});
