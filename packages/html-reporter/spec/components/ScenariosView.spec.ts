import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

test.describe('ScenariosView deep linking', () => {

    const data = minimalData();

    test('filters by search param in route', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=%22Test+D%22' },
            data,
        });

        await expect(page.locator('body')).toContainText('Test D');
        await expect(page.locator('body')).toContainText('Showing 1 of 4');
    });

    test('filters by outcome filter param in route', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?filter=failed' },
            data,
        });

        await expect(page.locator('body')).toContainText('Showing 1 of 4');
        await expect(page.locator('body')).toContainText('Test D');
    });

    test('applies both search and filter params', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?search=Suite&filter=passed' },
            data,
        });

        // Only passed tests in category "Suite" (Test A and Test B)
        await expect(page.locator('body')).toContainText('Showing 2 of 4');
    });

    test('shows all scenarios with no params', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests' },
            data,
        });

        await expect(page.locator('body')).toContainText('Showing 4 of 4');
    });

    test('filters by run param showing only matching run', async ({ mount, page }) => {
        await mount({
            component: 'ScenariosView',
            importPath: './components/ScenariosView',
            props: { onNavigate: () => {}, route: '/tests?run=2024-06-14T10:00:00.000Z' },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: 'build 41', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 800, slowest: 300, fastest: 100, scenarios: [{ name: 'Old Test', category: 'Old', outcome: 'SUCCESS', duration: 100, startedAt: '2024-06-14T10:00:00.000Z', source: { path: 'old.spec.ts', line: 1 }, tags: [], activities: [] }] },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: 'build 42', outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 1000, slowest: 400, fastest: 100 },
                ],
            }),
        });

        // RunSelector should be visible when run param is present
        await expect(page.locator('body')).toContainText('Test run');
    });
});
