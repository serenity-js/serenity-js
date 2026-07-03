import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

/**
 * Builds a ReportData fixture for a scenario with mixed retry history.
 *
 * The scenario has two runs:
 * - Run #41: failed without retries (simple failure)
 * - Run #42: retried twice, succeeded on 3rd attempt
 *
 * The builder derives `scenario.attempts` and `scenario.retries` from
 * the latest execution history entry, matching how the real aggregator works.
 */
function scenarioWithMixedRetryHistory() {
    const run1Entry = {
        outcome: 'FAILURE', run: '#41',
        timestamp: '2024-06-14T10:00:00.000Z',
        duration: 200,
        activities: [{ name: 'step from run 1', outcome: 'FAILURE', duration: 200, children: [] }],
        error: { name: 'Error', message: 'run 1 failed' },
    };

    const run2Attempts = [
        { attemptNumber: 1, outcome: 'FAILURE', duration: 200, activities: [{ name: 'attempt 1 step', outcome: 'FAILURE', duration: 200, children: [] }], error: { name: 'Error', message: 'attempt 1 failed' } },
        { attemptNumber: 2, outcome: 'FAILURE', duration: 180, activities: [{ name: 'attempt 2 step', outcome: 'FAILURE', duration: 180, children: [] }], error: { name: 'Error', message: 'attempt 2 failed' } },
        { attemptNumber: 3, outcome: 'SUCCESS', duration: 150, activities: [{ name: 'attempt 3 step', outcome: 'SUCCESS', duration: 150, children: [] }] },
    ];

    const run2Entry = {
        outcome: 'SUCCESS', run: '#42',
        timestamp: '2024-06-15T14:30:00.000Z',
        duration: 500,
        activities: [{ name: 'final step', outcome: 'SUCCESS', duration: 150, children: [] }],
        retries: 2,
        attempts: run2Attempts,
    };

    // Scenario-level fields mirror the latest run (run #42)
    return minimalData({
        scenarios: [
            {
                name: 'retried test', category: 'Suite', outcome: 'SUCCESS', duration: 150,
                startedAt: '2024-06-15T14:30:00.000Z',
                source: { path: 'spec/retried.spec.ts', line: 8 },
                tags: [],
                activities: run2Attempts[run2Attempts.length - 1].activities,
                executionHistory: [run1Entry, run2Entry],
                retries: run2Entry.retries,
                attempts: run2Entry.attempts,
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

const SCENARIO_ID = 'spec/retried.spec.ts:8';
const RUN_1_TIMESTAMP = '2024-06-14T10:00:00.000Z';

test.describe('ScenarioDetailView — per-run retry tabs', () => {

    test.describe('when viewing the latest run (retried)', () => {

        test('shows attempt tabs', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/ScenarioDetailView',
                props: { scenarioId: SCENARIO_ID, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.retry-tab')).toHaveCount(3);
            await expect(page.locator('.retry-tab').first()).toContainText('Attempt 1');
            await expect(page.locator('.retry-tab').last()).toContainText('Attempt 3');
        });

        test('displays the scenario duration', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/ScenarioDetailView',
                props: { scenarioId: SCENARIO_ID, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.scenario-detail-meta')).toContainText('150ms');
        });

        test('switches activity tree when clicking attempt tabs', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/ScenarioDetailView',
                props: { scenarioId: SCENARIO_ID, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            // Starts with attempt 1
            await expect(page.locator('.activity-tree')).toContainText('attempt 1 step');

            // Click attempt 3 tab
            await page.locator('.retry-tab').last().click();
            await expect(page.locator('.activity-tree')).toContainText('attempt 3 step');
        });
    });

    test.describe('when viewing a historical run that was not retried', () => {

        test('hides attempt tabs', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/ScenarioDetailView',
                props: { scenarioId: `${SCENARIO_ID}?run=${RUN_1_TIMESTAMP}`, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.retry-tab')).toHaveCount(0);
        });

        test('displays the historical run duration', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/ScenarioDetailView',
                props: { scenarioId: `${SCENARIO_ID}?run=${RUN_1_TIMESTAMP}`, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.scenario-detail-meta')).toContainText('200ms');
        });

        test('shows activities from the historical run', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/ScenarioDetailView',
                props: { scenarioId: `${SCENARIO_ID}?run=${RUN_1_TIMESTAMP}`, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.activity-tree')).toContainText('step from run 1');
        });

        test('shows error block from the historical run', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/ScenarioDetailView',
                props: { scenarioId: `${SCENARIO_ID}?run=${RUN_1_TIMESTAMP}`, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.error-block')).toContainText('run 1 failed');
        });
    });
});
