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

    test('navigates to filtered scenarios view when clicking a grouped error', async ({ mount, page }) => {
        let navigatedTo = '';
        await page.exposeFunction('__onNavigate__', (path: string) => { navigatedTo = path; });

        await mount({
            component: 'ErrorsView',
            importPath: './components/ErrorsView',
            props: { onNavigate: '__onNavigate__', route: '#/errors' },
            data: errorsData(),
        });

        // Click the first grouped error row (Login fails + Signup fails share the same error message)
        await page.locator('.scenario-item').first().click();

        // The component should navigate to a search URL containing the error message
        expect(navigatedTo).toContain('/tests?search=');
        expect(decodeURIComponent(navigatedTo)).toContain('expected true to equal false');
    });

    test('navigates to scenario detail when clicking a unique error', async ({ mount, page }) => {
        let navigatedTo = '';
        await page.exposeFunction('__onNavigate__', (path: string) => { navigatedTo = path; });

        await mount({
            component: 'ErrorsView',
            importPath: './components/ErrorsView',
            props: { onNavigate: '__onNavigate__', route: '#/errors' },
            data: errorsData(),
        });

        // Click the unique "timed out" error row
        await page.locator('.scenario-item', { hasText: 'timed out' }).click();

        // Should navigate to the specific scenario (not a search)
        expect(decodeURIComponent(navigatedTo)).toContain('spec/slow.spec.ts');
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
