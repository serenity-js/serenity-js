import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

function retryScenarioData() {
    return minimalData({
        scenarios: [
            {
                name: 'flaky test', category: 'Suite', outcome: 'SUCCESS', duration: 150,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/flaky.spec.ts', line: 8 },
                tags: [], activities: [{ name: 'final step', outcome: 'SUCCESS', duration: 150, children: [] }],
                executionHistory: [
                    {
                        outcome: 'FAILURE', run: '#41',
                        timestamp: '2024-06-14T10:00:00.000Z',
                        duration: 200,
                        activities: [{ name: 'step from run 1', outcome: 'FAILURE', duration: 200, children: [] }],
                        error: { name: 'Error', message: 'run 1 failed' },
                        // No attempts — this run was NOT retried
                    },
                    {
                        outcome: 'SUCCESS', run: '#42',
                        timestamp: '2024-06-15T14:30:00.000Z',
                        duration: 500,
                        activities: [{ name: 'final step', outcome: 'SUCCESS', duration: 150, children: [] }],
                        retries: 2,
                        attempts: [
                            { attemptNumber: 1, outcome: 'FAILURE', duration: 200, activities: [{ name: 'attempt 1 step', outcome: 'FAILURE', duration: 200, children: [] }], error: { name: 'Error', message: 'attempt 1 failed' } },
                            { attemptNumber: 2, outcome: 'FAILURE', duration: 180, activities: [{ name: 'attempt 2 step', outcome: 'FAILURE', duration: 180, children: [] }], error: { name: 'Error', message: 'attempt 2 failed' } },
                            { attemptNumber: 3, outcome: 'SUCCESS', duration: 150, activities: [{ name: 'attempt 3 step', outcome: 'SUCCESS', duration: 150, children: [] }] },
                        ],
                    },
                ],
                retries: 2,
                attempts: [
                    { attemptNumber: 1, outcome: 'FAILURE', duration: 200, activities: [{ name: 'attempt 1 step', outcome: 'FAILURE', duration: 200, children: [] }], error: { name: 'Error', message: 'attempt 1 failed' } },
                    { attemptNumber: 2, outcome: 'FAILURE', duration: 180, activities: [{ name: 'attempt 2 step', outcome: 'FAILURE', duration: 180, children: [] }], error: { name: 'Error', message: 'attempt 2 failed' } },
                    { attemptNumber: 3, outcome: 'SUCCESS', duration: 150, activities: [{ name: 'attempt 3 step', outcome: 'SUCCESS', duration: 150, children: [] }] },
                ],
            },
        ],
        history: [
            {
                timestamp: '2024-06-14T10:00:00.000Z', label: '#41',
                outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                duration: 200, slowest: 200, fastest: 200, average: 200,
            },
            {
                timestamp: '2024-06-15T14:30:00.000Z', label: '#42',
                outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 },
                duration: 500, slowest: 500, fastest: 500, average: 500,
            },
        ],
    });
}

test.describe('ScenarioDetailView — per-run retry tabs', () => {

    test('shows attempt tabs when viewing the latest (retried) run', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/flaky.spec.ts:8', onNavigate: () => {} },
            data: retryScenarioData(),
        });

        // Attempt tabs should be visible for the latest run (which has retries)
        await expect(page.locator('.retry-tab')).toHaveCount(3);
        await expect(page.locator('.retry-tab').first()).toContainText('Attempt 1');
        await expect(page.locator('.retry-tab').last()).toContainText('Attempt 3');
    });

    test('hides attempt tabs when viewing a historical run that was not retried', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            // ?run= points to the first history entry (index 0 by timestamp)
            props: { scenarioId: 'spec/flaky.spec.ts:8?run=2024-06-14T10:00:00.000Z', onNavigate: () => {} },
            data: retryScenarioData(),
        });

        // No attempt tabs should appear for run #41 (not retried)
        await expect(page.locator('.retry-tab')).toHaveCount(0);
    });

    test('displays correct duration for the selected historical run', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/flaky.spec.ts:8?run=2024-06-14T10:00:00.000Z', onNavigate: () => {} },
            data: retryScenarioData(),
        });

        // Run #41 had duration 200ms
        await expect(page.locator('.scenario-detail-meta')).toContainText('200ms');
    });

    test('displays correct duration for the latest (retried) run', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/flaky.spec.ts:8', onNavigate: () => {} },
            data: retryScenarioData(),
        });

        // Latest run (scenario.duration) is 150ms
        await expect(page.locator('.scenario-detail-meta')).toContainText('150ms');
    });

    test('shows activities from the historical run when viewing it', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/flaky.spec.ts:8?run=2024-06-14T10:00:00.000Z', onNavigate: () => {} },
            data: retryScenarioData(),
        });

        // Should show activities from run #41
        await expect(page.locator('.activity-tree')).toContainText('step from run 1');
    });

    test('shows attempt activities when clicking attempt tabs on the retried run', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/flaky.spec.ts:8', onNavigate: () => {} },
            data: retryScenarioData(),
        });

        // Initially shows attempt 1 (activeAttempt=0)
        await expect(page.locator('.activity-tree')).toContainText('attempt 1 step');

        // Click attempt 3 tab
        await page.locator('.retry-tab').last().click();
        await expect(page.locator('.activity-tree')).toContainText('attempt 3 step');
    });

    test('shows error block for the non-retried historical run', async ({ mount, page }) => {
        await mount({
            component: 'ScenarioDetailView',
            importPath: './components/ScenarioDetailView',
            props: { scenarioId: 'spec/flaky.spec.ts:8?run=2024-06-14T10:00:00.000Z', onNavigate: () => {} },
            data: retryScenarioData(),
        });

        await expect(page.locator('.error-block')).toContainText('run 1 failed');
    });
});
