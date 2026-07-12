import { Ensure, equals } from '@serenity-js/assertions';

import { ScenarioDetailView } from '../../../src/serenity/scenarios/ScenarioDetailView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

describe('ScenarioDetailView interaction object', () => {

    it('displays the scenario name', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenarioDetailView',
            importPath: './components/scenarios/ScenarioDetailView',
            props: { scenarioId: 'spec/a.spec.ts:Checkout flow', onNavigate: () => {} },
            data: minimalData({
                scenarios: [
                    {
                        name: 'Checkout flow', category: 'E2E', outcome: 'SUCCESS', duration: 500,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'spec/a.spec.ts' },
                        tags: [], activities: [], executionHistory: [],
                    },
                ],
            }),
            interactionObject: ScenarioDetailView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioName(), equals('Checkout flow')),
        );
    });

    it('shows error block when the scenario has an error', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenarioDetailView',
            importPath: './components/scenarios/ScenarioDetailView',
            props: { scenarioId: 'spec/b.spec.ts:5', onNavigate: () => {} },
            data: minimalData({
                scenarios: [
                    {
                        name: 'Failing test', category: 'Suite', outcome: 'FAILURE', duration: 200,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'spec/b.spec.ts', line: 5 },
                        tags: [], activities: [], executionHistory: [],
                        error: { name: 'AssertionError', message: 'Expected 1 to equal 2', stack: 'at line 5' },
                    },
                ],
            }),
            interactionObject: ScenarioDetailView,
        });

        await actor.attemptsTo(
            Ensure.that(view.hasError(), equals(true)),
            Ensure.that(view.errorBlock().name(), equals('AssertionError')),
            Ensure.that(view.errorBlock().message(), equals('Expected 1 to equal 2')),
        );
    });

    it('hides error block when the scenario has no error', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenarioDetailView',
            importPath: './components/scenarios/ScenarioDetailView',
            props: { scenarioId: 'spec/a.spec.ts:Passing test', onNavigate: () => {} },
            data: minimalData({
                scenarios: [
                    {
                        name: 'Passing test', category: 'Suite', outcome: 'SUCCESS', duration: 100,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'spec/a.spec.ts' },
                        tags: [], activities: [], executionHistory: [],
                    },
                ],
            }),
            interactionObject: ScenarioDetailView,
        });

        await actor.attemptsTo(
            Ensure.that(view.hasError(), equals(false)),
        );
    });

    it('can find an activity by name and read its outcome', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenarioDetailView',
            importPath: './components/scenarios/ScenarioDetailView',
            props: { scenarioId: 'spec/b.spec.ts:5', onNavigate: () => {} },
            data: minimalData({
                scenarios: [
                    {
                        name: 'Test D', category: 'Suite', outcome: 'FAILURE', duration: 400,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'spec/b.spec.ts', line: 5 },
                        tags: [],
                        activities: [
                            { name: 'enters expired card details', outcome: 'SUCCESS', duration: 100, type: 'Interaction', children: [] },
                            { name: 'submits the payment', outcome: 'FAILURE', duration: 200, type: 'Interaction', children: [] },
                        ],
                        executionHistory: [
                            { outcome: 'SUCCESS', run: '#41' },
                            { outcome: 'FAILURE', run: '#42' },
                        ],
                        error: { name: 'AssertionError', message: 'Payment rejected', stack: '' },
                    },
                ],
            }),
            interactionObject: ScenarioDetailView,
        });

        await actor.attemptsTo(
            Ensure.that(view.activityCalled('submits the payment').outcome(), equals('FAILURE')),
        );
    });

    it('can count execution history dots', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenarioDetailView',
            importPath: './components/scenarios/ScenarioDetailView',
            props: { scenarioId: 'spec/b.spec.ts:5', onNavigate: () => {} },
            data: minimalData({
                scenarios: [
                    {
                        name: 'Test D', category: 'Suite', outcome: 'FAILURE', duration: 400,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'spec/b.spec.ts', line: 5 },
                        tags: [],
                        activities: [
                            { name: 'submits the payment', outcome: 'FAILURE', duration: 200, type: 'Interaction', children: [] },
                        ],
                        executionHistory: [
                            { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                            { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                        ],
                        error: { name: 'AssertionError', message: 'Payment rejected', stack: '' },
                    },
                ],
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 100, slowest: 100, fastest: 100, average: 100 },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 400, slowest: 400, fastest: 400, average: 400 },
                ],
            }),
            interactionObject: ScenarioDetailView,
        });

        await actor.attemptsTo(
            Ensure.that(view.executionHistoryDotCount(), equals(2)),
        );
    });

    it('counts screenshots in the photo strip', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenarioDetailView',
            importPath: './components/scenarios/ScenarioDetailView',
            props: { scenarioId: 'test-photos', onNavigate: () => {}, specDirectory: '' },
            data: {
                scenarios: [{
                    id: 'test-photos', name: 'Test with photos', category: 'Suite', outcome: 'FAILURE', duration: 400,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/photos.spec.ts' },
                    tags: [],
                    activities: [
                        {
                            name: 'clicks the button', outcome: 'SUCCESS', duration: 100, type: 'Interaction', children: [],
                            startedAt: '2024-06-15T14:30:00.100Z',
                            artifacts: [{ path: 'screenshots/1.png' }],
                        },
                        {
                            name: 'sees the result', outcome: 'FAILURE', duration: 200, type: 'Interaction', children: [],
                            startedAt: '2024-06-15T14:30:00.200Z',
                            artifacts: [{ path: 'screenshots/2.png' }],
                        },
                    ],
                    executionHistory: [],
                    error: { name: 'AssertionError', message: 'Expected result', stack: '' },
                }],
                history: [
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 400, slowest: 400, fastest: 400, average: 400 },
                ],
            },
            dataAsProps: true,
            interactionObject: ScenarioDetailView,
        });

        await actor.attemptsTo(
            Ensure.that(view.photoStripCount(), equals(2)),
        );
    });
});

describe('ScenarioDetailView — copy source location', () => {

    it('has a copy source location button', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenarioDetailView',
            importPath: './components/scenarios/ScenarioDetailView',
            props: { scenarioId: 'spec/b.spec.ts:42', onNavigate: () => {} },
            data: minimalData({
                scenarios: [
                    {
                        name: 'Test D', category: 'Suite', outcome: 'FAILURE', duration: 400,
                        startedAt: '2024-06-15T14:30:00.000Z',
                        source: { path: 'spec/b.spec.ts', line: 42 },
                        tags: [],
                        activities: [
                            { name: 'step one', outcome: 'FAILURE', duration: 200, type: 'Interaction', children: [] },
                        ],
                        executionHistory: [],
                        error: { name: 'Error', message: 'something failed', stack: '' },
                    },
                ],
            }),
            interactionObject: ScenarioDetailView,
        });

        await actor.attemptsTo(
            Ensure.that(view.hasCopySourceButton(), equals(true)),
        );
    });
});

describe('ScenarioDetailView — retry attempt switching', () => {

    it('can switch between retry attempts', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ScenarioDetailView',
            importPath: './components/scenarios/ScenarioDetailView',
            props: { scenarioId: 'spec/retried.spec.ts:8', onNavigate: () => {} },
            data: scenarioWithMixedRetryHistory(),
            interactionObject: ScenarioDetailView,
        });

        await actor.attemptsTo(
            view.switchToAttempt(2),
            Ensure.that(view.hasError(), equals(true)),
        );
    });
});

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

describe('ScenarioDetailView — per-run retry tabs', () => {

    describe('when viewing the latest run (retried)', () => {

        it('shows attempt tabs', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/scenarios/ScenarioDetailView',
                props: { scenarioId: SCENARIO_ID, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.retry-tab')).toHaveCount(3);
            await expect(page.locator('.retry-tab').first()).toContainText('Attempt 1');
            await expect(page.locator('.retry-tab').last()).toContainText('Attempt 3');
        });

        it('displays the scenario duration', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/scenarios/ScenarioDetailView',
                props: { scenarioId: SCENARIO_ID, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.scenario-detail-meta')).toContainText('150ms');
        });

        it('switches activity tree when clicking attempt tabs', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/scenarios/ScenarioDetailView',
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

    describe('when viewing a historical run that was not retried', () => {

        it('hides attempt tabs', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/scenarios/ScenarioDetailView',
                props: { scenarioId: `${SCENARIO_ID}?run=${RUN_1_TIMESTAMP}`, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.retry-tab')).toHaveCount(0);
        });

        it('displays the historical run duration', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/scenarios/ScenarioDetailView',
                props: { scenarioId: `${SCENARIO_ID}?run=${RUN_1_TIMESTAMP}`, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.scenario-detail-meta')).toContainText('200ms');
        });

        it('shows activities from the historical run', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/scenarios/ScenarioDetailView',
                props: { scenarioId: `${SCENARIO_ID}?run=${RUN_1_TIMESTAMP}`, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.activity-tree')).toContainText('step from run 1');
        });

        it('shows error block from the historical run', async ({ mount, page }) => {
            await mount({
                component: 'ScenarioDetailView',
                importPath: './components/scenarios/ScenarioDetailView',
                props: { scenarioId: `${SCENARIO_ID}?run=${RUN_1_TIMESTAMP}`, onNavigate: () => {} },
                data: scenarioWithMixedRetryHistory(),
            });

            await expect(page.locator('.error-block')).toContainText('run 1 failed');
        });
    });
});
