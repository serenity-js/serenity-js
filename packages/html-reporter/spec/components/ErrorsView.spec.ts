import { minimalData } from './data-factories.js';
import { describe, expect, it } from './fixtures.js';

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

describe('ErrorsView', () => {

    it('groups scenarios with identical error messages', async ({ mount, page }) => {
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

    it('navigates to filtered scenarios view when clicking a grouped error', async ({ mount, page }) => {
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

    it('navigates to scenario detail when clicking a unique error', async ({ mount, page }) => {
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

    it('single error row does not show duplicate indicator', async ({ mount, page }) => {
        await mount({
            component: 'ErrorsView',
            importPath: './components/ErrorsView',
            props: { onNavigate: () => {}, route: '#/errors' },
            data: errorsData(),
        });

        // The timeout error is unique (not grouped), should not show "×"
        await expect(page.locator('.scenario-item', { hasText: 'timed out' })).not.toContainText('×');
    });

    it('shows errors from a historical run when ?run= parameter is set', async ({ mount, page }) => {
        // Scenario A: passed in latest run (#42), failed in historical run (#41)
        // Scenario B: failed in latest run (#42), passed in historical run (#41)
        const data = minimalData({
            scenarios: [
                {
                    name: 'Scenario A (passes now)', category: 'Suite', outcome: 'SUCCESS', duration: 100,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/a.spec.ts', line: 5 },
                    tags: [], activities: [],
                    executionHistory: [
                        { outcome: 'FAILURE', run: '#41', timestamp: '2024-06-14T10:00:00.000Z', error: { name: 'AssertionError', message: 'historical failure in run 41' } },
                        { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                    ],
                },
                {
                    name: 'Scenario B (fails now)', category: 'Suite', outcome: 'FAILURE', duration: 200,
                    startedAt: '2024-06-15T14:30:00.100Z',
                    source: { path: 'spec/b.spec.ts', line: 10 },
                    tags: [], activities: [],
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                        { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z', error: { name: 'Error', message: 'latest failure in run 42' } },
                    ],
                    error: { name: 'Error', message: 'latest failure in run 42' },
                },
            ],
            history: [
                { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 100, average: 150 },
                { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 100, average: 150 },
            ],
        });

        // View errors from run #41 (historical)
        await mount({
            component: 'ErrorsView',
            importPath: './components/ErrorsView',
            props: { onNavigate: () => {}, route: '#/errors?run=2024-06-14T10:00:00.000Z' },
            data,
        });

        // Should show Scenario A (which failed in run #41)
        await expect(page.locator('body')).toContainText('historical failure in run 41');
        // Should NOT show Scenario B (which passed in run #41)
        await expect(page.locator('body')).not.toContainText('latest failure in run 42');
    });

    it('shows "No Errors" when the selected historical run had no failures', async ({ mount, page }) => {
        const data = minimalData({
            scenarios: [
                {
                    name: 'Scenario that fails now', category: 'Suite', outcome: 'FAILURE', duration: 200,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/a.spec.ts', line: 5 },
                    tags: [], activities: [],
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                        { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z', error: { name: 'Error', message: 'fails now' } },
                    ],
                    error: { name: 'Error', message: 'fails now' },
                },
            ],
            history: [
                { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
            ],
        });

        // View errors from run #41 (which had no failures)
        await mount({
            component: 'ErrorsView',
            importPath: './components/ErrorsView',
            props: { onNavigate: () => {}, route: '#/errors?run=2024-06-14T10:00:00.000Z' },
            data,
        });

        // Should show the "No Errors" placeholder
        await expect(page.locator('body')).toContainText('No Errors');
    });
});
