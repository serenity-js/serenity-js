import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

function requirementsData() {
    return minimalData({
        requirements: {
            name: 'spec',
            type: 'directory',
            outcomes: { passed: 5, failed: 1, pending: 1, skipped: 0, compromised: 0, error: 0 },
            children: [
                {
                    name: 'passing-feature',
                    type: 'directory',
                    outcomes: { passed: 3, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                    children: [
                        { name: 'login.spec.ts', type: 'file', outcomes: { passed: 3, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 } },
                    ],
                },
                {
                    name: 'failing-feature',
                    type: 'directory',
                    outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                    children: [
                        { name: 'checkout.spec.ts', type: 'file', outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 } },
                    ],
                },
                {
                    name: 'pending-feature',
                    type: 'directory',
                    outcomes: { passed: 1, failed: 0, pending: 1, skipped: 0, compromised: 0, error: 0 },
                    children: [
                        { name: 'search.spec.ts', type: 'file', outcomes: { passed: 1, failed: 0, pending: 1, skipped: 0, compromised: 0, error: 0 } },
                    ],
                },
            ],
        },
    });
}

test.describe('RequirementsView', () => {

    test('renders KPI cards with Total Requirements active by default', async ({ mount, page }) => {
        await mount({
            component: 'RequirementsView',
            importPath: './components/RequirementsView',
            data: requirementsData(),
            props: { onNavigate: () => undefined, route: '#/requirements' },
        });

        await expect(page.locator('.kpi-card--active')).toHaveCount(1);
        await expect(page.locator('.kpi-card--active')).toContainText('Total Requirements');
    });

    test('shows all tree nodes when Total Requirements is active', async ({ mount, page }) => {
        await mount({
            component: 'RequirementsView',
            importPath: './components/RequirementsView',
            data: requirementsData(),
            props: { onNavigate: () => undefined, route: '#/requirements' },
        });

        await expect(page.locator('.req-tree-label')).toContainText(['passing-feature', 'failing-feature', 'pending-feature']);
    });

    test('clicking Completeness filters tree to nodes with incomplete requirements', async ({ mount, page }) => {
        await mount({
            component: 'RequirementsView',
            importPath: './components/RequirementsView',
            data: requirementsData(),
            props: { onNavigate: () => undefined, route: '#/requirements' },
        });

        await page.locator('.kpi-card', { hasText: 'Completeness' }).click();

        await expect(page.locator('.kpi-card--active')).toContainText('Completeness');
        const tree = page.locator('.req-tree-panel');
        await expect(tree).toContainText('failing-feature');
        await expect(tree).toContainText('pending-feature');
        await expect(tree).not.toContainText('passing-feature');
    });

    test('clicking Requirement Gaps filters tree to nodes with gaps', async ({ mount, page }) => {
        await mount({
            component: 'RequirementsView',
            importPath: './components/RequirementsView',
            data: requirementsData(),
            props: { onNavigate: () => undefined, route: '#/requirements' },
        });

        await page.locator('.kpi-card', { hasText: 'Gaps' }).click();

        await expect(page.locator('.kpi-card--active')).toContainText('Gaps');
        // pending-feature has a gap (pending scenario)
        await expect(page.locator('body')).toContainText('pending-feature');
    });

    test('clicking Total Requirements resets the filter', async ({ mount, page }) => {
        await mount({
            component: 'RequirementsView',
            importPath: './components/RequirementsView',
            data: requirementsData(),
            props: { onNavigate: () => undefined, route: '#/requirements' },
        });

        const tree = page.locator('.req-tree-panel');
        await page.locator('.kpi-card', { hasText: 'Completeness' }).click();
        await expect(tree).not.toContainText('passing-feature');

        await page.locator('.kpi-card', { hasText: 'Total Requirements' }).click();
        await expect(tree).toContainText('passing-feature');
        await expect(page.locator('.kpi-card--active')).toContainText('Total Requirements');
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
