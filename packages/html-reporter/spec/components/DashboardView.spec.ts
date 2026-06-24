import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

test.describe('DashboardView', () => {

    test('renders donut chart canvas', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),

        });
        await expect(page.locator('canvas').first()).toBeVisible();
    });

    test('displays pass rate', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),

        });

        await expect(page.locator('body')).toContainText('75.0%');
    });

    test('displays CI branch and commit info', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),

        });

        await expect(page.locator('body')).toContainText('main');
        await expect(page.locator('body')).toContainText('abc1234');
    });

    test('displays slowest tests', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),

        });

        await expect(page.locator('body')).toContainText('Slowest');
        await expect(page.locator('body')).toContainText('Test D');
    });

    test('displays total failed count', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),

        });

        await expect(page.locator('body')).toContainText('Failed');
        await expect(page.locator('.kpi-card', { hasText: 'Failed' }).locator('.kpi-value')).toHaveText('1');
    });

    test('shows "No degraded tests" when none degraded', async ({ mount, page }) => {
        await mount({
            component: 'DashboardView',
            importPath: './components/DashboardView',
            props: { onNavigate: () => {} },
            data: minimalData(),

        });

        await expect(page.locator('body')).toContainText('No degraded tests');
    });
});
