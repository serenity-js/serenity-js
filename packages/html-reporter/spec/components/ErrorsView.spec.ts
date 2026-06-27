import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

function errorsData() {
    return minimalData({
        scenarios: [
            {
                name: 'Login fails', category: 'Auth', outcome: 'FAILURE', duration: 50,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/auth.spec.ts', line: 10 },
                tags: [], activities: [],
                executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
                error: { name: 'AssertionError', message: 'expected true to equal false' },
            },
            {
                name: 'Signup fails', category: 'Auth', outcome: 'FAILURE', duration: 60,
                startedAt: '2024-06-15T14:30:00.100Z',
                source: { path: 'spec/auth.spec.ts', line: 20 },
                tags: [], activities: [],
                executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
                error: { name: 'AssertionError', message: 'expected true to equal false' },
            },
            {
                name: 'Timeout test', category: 'Suite', outcome: 'FAILURE', duration: 5000,
                startedAt: '2024-06-15T14:30:00.200Z',
                source: { path: 'spec/slow.spec.ts', line: 5 },
                tags: [], activities: [],
                executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
                error: { name: 'Error', message: 'timed out after 5000ms' },
            },
        ],
        summary: {
            title: 'Test', totalScenarios: 3,
            outcomes: { passed: 0, failed: 3, pending: 0, skipped: 0, compromised: 0, error: 0 },
            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:05.000Z',
            duration: 5000, testRunner: 'Mocha',
        },
    });
}

test.describe('ErrorsView', () => {

    test('groups scenarios with identical error messages', async ({ mount, page }) => {
        await mount({
            component: 'ErrorsView',
            importPath: './components/ErrorsView',
            props: { onNavigate: () => {}, route: '#/errors' },
            data: errorsData(),
        });

        // Should show "(×2)" for the duplicated error message
        await expect(page.locator('body')).toContainText('(×2)');
        // Should show "and 1 more" after the first scenario name
        await expect(page.locator('body')).toContainText('and 1 more');
    });

    test('grouped error row navigates to filtered test scenarios view', async ({ mount, page }) => {
        await page.evaluate(() => { (window as any).__lastNav__ = ''; });
        await mount({
            component: 'ErrorsView',
            importPath: './components/ErrorsView',
            props: { onNavigate: '__NAV_FN__', route: '#/errors' },
            data: errorsData(),
        });

        // Inject navigation tracker
        await page.evaluate(() => {
            document.querySelectorAll('.scenario-item')[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        // Verify the grouped row exists and contains the search filter indication
        const firstRow = page.locator('.scenario-item').first();
        await expect(firstRow).toContainText('and 1 more');
    });

    test('single error row does not show duplicate indicator', async ({ mount, page }) => {
        await mount({
            component: 'ErrorsView',
            importPath: './components/ErrorsView',
            props: { onNavigate: () => {}, route: '#/errors' },
            data: errorsData(),
        });

        // The timeout error is unique (not grouped), should not show "×"
        await expect(page.locator('.scenario-item', { hasText: 'timed out' })).not.toContainText('×');
    });
});
