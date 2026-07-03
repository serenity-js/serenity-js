import { minimalData } from './data-factories';
import { expect, test } from './fixtures';

function scenarioWithHistory(executionHistory: Array<{ outcome: string; run: string; timestamp?: string }>) {
    return {
        name: 'Test Scenario',
        category: 'Suite',
        outcome: executionHistory[executionHistory.length - 1]?.outcome || 'SUCCESS',
        duration: 200,
        startedAt: '2024-06-15T14:30:00.000Z',
        source: { path: 'spec/test.spec.ts', line: 10 },
        tags: [],
        activities: [],
        executionHistory,
    };
}

test.describe('ExecutionHistory', () => {

    test('renders nothing when executionHistory is empty', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData(),
        });

        await expect(page.locator('.exec-history-strip')).toHaveCount(0);
        await expect(page.locator('.card-title')).toHaveCount(0);
    });

    test('displays the section title "Execution History"', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData(),
        });

        await expect(page.locator('.card-title')).toHaveText('Execution History');
    });

    test('shows "X of Y passing" summary', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#43', timestamp: '2024-06-16T10:00:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-15T10:00:00.000Z', label: '#42', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-16T10:00:00.000Z', label: '#43', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
            }),
        });

        const summary = page.locator('.exec-history-summary');
        await expect(summary).toContainText('2 of 3 passing');
    });

    test('computes consistency as percentage of non-flipping transitions', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    // 4 runs: SUCCESS → FAILURE → SUCCESS → SUCCESS
                    // 3 transitions: 2 flips (S→F, F→S), 1 stable (S→S)
                    // consistency = round((1 - 2/3) * 100) = 33%
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#43', timestamp: '2024-06-16T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#44', timestamp: '2024-06-17T10:00:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-15T10:00:00.000Z', label: '#42', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-16T10:00:00.000Z', label: '#43', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-17T10:00:00.000Z', label: '#44', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
            }),
        });

        const summary = page.locator('.exec-history-summary');
        await expect(summary).toContainText('33% consistent');
    });

    test('shows 100% consistency when there is only one run', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
            }),
        });

        const summary = page.locator('.exec-history-summary');
        await expect(summary).toContainText('100% consistent');
    });

    test('shows 100% consistency when all runs have the same outcome', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#43', timestamp: '2024-06-16T10:00:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-15T10:00:00.000Z', label: '#42', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-16T10:00:00.000Z', label: '#43', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
            }),
        });

        const summary = page.locator('.exec-history-summary');
        await expect(summary).toContainText('100% consistent');
    });

    test('renders a dot for each run in the execution history', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData(),
        });

        const dots = page.locator('.exec-history-dot');
        await expect(dots).toHaveCount(2);
    });

    test('highlights the latest run as active when runIndex is null', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData(),
        });

        const activeItems = page.locator('.exec-history-item--active');
        await expect(activeItems).toHaveCount(1);
        // The last item should be active
        const items = page.locator('.exec-history-item');
        const lastItem = items.last();
        await expect(lastItem).toHaveClass(/exec-history-item--active/);
    });

    test('highlights the specified runIndex as active', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                ]),
                runIndex: 0,
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
                onNavigate: () => {},
            },
            data: minimalData(),
        });

        const activeItems = page.locator('.exec-history-item--active');
        await expect(activeItems).toHaveCount(1);
        // The first item should be active
        const items = page.locator('.exec-history-item');
        const firstItem = items.first();
        await expect(firstItem).toHaveClass(/exec-history-item--active/);
    });

    test('groups runs by date', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-14T14:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#43', timestamp: '2024-06-15T10:00:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-14T14:00:00.000Z', label: '#42', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-15T10:00:00.000Z', label: '#43', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
            }),
        });

        // Two date groups: 14 Jun and 15 Jun
        const dateHeaders = page.locator('.exec-history-date');
        await expect(dateHeaders).toHaveCount(2);
    });

    test('uses run labels for non-ISO run identifiers', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: 'build-41', timestamp: '2024-06-14T10:00:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: 'build-41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
            }),
        });

        const label = page.locator('.exec-history-label');
        await expect(label).toHaveText('build-41');
    });

    test('navigates to the correct URL when clicking a historical run for a scenario with a browser tag', async ({ mount, page }) => {
        let navigatedTo = '';
        await page.exposeFunction('__onNavigate__', (path: string) => { navigatedTo = path; });

        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: {
                    name: 'Test Scenario',
                    category: 'Suite',
                    outcome: 'SUCCESS',
                    duration: 200,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/test.spec.ts', line: 10 },
                    tags: [{ type: 'browser', name: 'chrome 129.0.6668.100' }],
                    activities: [],
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#8213', timestamp: '2024-06-14T08:00:00.000Z' },
                        { outcome: 'SUCCESS', run: '#8214', timestamp: '2024-06-14T10:00:00.000Z' },
                        { outcome: 'SUCCESS', run: '#8219', timestamp: '2024-06-15T14:30:00.000Z' },
                    ],
                },
                runIndex: null,
                history: [
                    { timestamp: '2024-06-14T08:00:00.000Z', label: '#8213', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#8214', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#8219', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
                onNavigate: '__onNavigate__',
            },
            data: minimalData(),
        });

        // Click the first run (a historical, non-active run)
        await page.locator('.exec-history-item').first().click();

        // The URL should be properly formed with both browser and run parameters
        const decoded = decodeURIComponent(navigatedTo);
        expect(decoded).toContain('browser=');
        expect(decoded).toContain('run=2024-06-14T08:00:00.000Z');
        // There should be only ONE '?' in the URL (proper query string)
        const questionMarkCount = (navigatedTo.match(/\?/g) || []).length;
        expect(questionMarkCount).toBe(1);
    });

    test('navigates using the entry timestamp even when the scenario does not appear in every global run', async ({ mount, page }) => {
        let navigatedTo = '';
        await page.exposeFunction('__onNavigate__', (path: string) => { navigatedTo = path; });

        // Scenario only appears in runs #8214 and #8219 (not #8213)
        // Global history has 3 entries, but executionHistory has only 2
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: {
                    name: 'Test Scenario',
                    category: 'Suite',
                    outcome: 'SUCCESS',
                    duration: 200,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/test.spec.ts', line: 10 },
                    tags: [{ type: 'browser', name: 'chrome 129.0.6668.100' }],
                    activities: [],
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#8214', timestamp: '2024-06-14T10:00:00.000Z' },
                        { outcome: 'SUCCESS', run: '#8219', timestamp: '2024-06-15T14:30:00.000Z' },
                    ],
                },
                runIndex: null,
                history: [
                    { timestamp: '2024-06-14T08:00:00.000Z', label: '#8213', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#8214', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#8219', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
                onNavigate: '__onNavigate__',
            },
            data: minimalData(),
        });

        // Click the first run (#8214, which is index 0 in executionHistory but index 1 in global history)
        await page.locator('.exec-history-item').first().click();

        // Should navigate with the correct timestamp from the entry itself
        const decoded = decodeURIComponent(navigatedTo);
        expect(decoded).toContain('run=2024-06-14T10:00:00.000Z');
        // Should NOT contain the timestamp from global history[0] which is #8213
        expect(decoded).not.toContain('run=2024-06-14T08:00:00.000Z');
    });

    test('only considers runs up to the active runIndex for the summary', async ({ mount, page }) => {
        const history = [
            { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
            { timestamp: '2024-06-15T10:00:00.000Z', label: '#42', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
            { timestamp: '2024-06-16T10:00:00.000Z', label: '#43', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
        ];

        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#43', timestamp: '2024-06-16T10:00:00.000Z' },
                ]),
                runIndex: 1, // Viewing run #42 — should only count first 2 runs
                history,
                onNavigate: () => {},
            },
            data: minimalData({ history }),
        });

        const summary = page.locator('.exec-history-summary');
        // Only runs up to index 1: 2 of 2 passing
        await expect(summary).toContainText('2 of 2 passing');
    });

    test('renders a retried-success dot with the correct CSS class when retriedAndPassed is true', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: {
                    name: 'Retried Test',
                    category: 'Suite',
                    outcome: 'SUCCESS',
                    duration: 500,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/test.spec.ts', line: 10 },
                    tags: [],
                    activities: [],
                    executionHistory: [
                        { outcome: 'FAILURE', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                        { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T14:30:00.000Z', retriedAndPassed: true, retries: 1 },
                    ],
                },
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
            }),
        });

        const dots = page.locator('.exec-history-dot');
        await expect(dots).toHaveCount(2);

        // First dot should be a regular failed dot
        const firstDot = dots.first();
        await expect(firstDot).not.toHaveClass(/exec-history-dot--retried-success/);

        // Second dot should have the retried-success class
        const secondDot = dots.last();
        await expect(secondDot).toHaveClass(/exec-history-dot--retried-success/);
    });

    test('shows "Passed on retry" tooltip for retried-success dots', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: {
                    name: 'Retried Test',
                    category: 'Suite',
                    outcome: 'SUCCESS',
                    duration: 500,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/test.spec.ts', line: 10 },
                    tags: [],
                    activities: [],
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T14:30:00.000Z', retriedAndPassed: true, retries: 1 },
                    ],
                },
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
            }),
        });

        const item = page.locator('.exec-history-item');
        const title = await item.getAttribute('title');
        expect(title).toContain('Passed on retry (attempt 2 of 2)');
    });

    test('renders retry icon in retried-success dots', async ({ mount, page }) => {
        await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenario/ExecutionHistory',
            props: {
                scenario: {
                    name: 'Retried Test',
                    category: 'Suite',
                    outcome: 'SUCCESS',
                    duration: 500,
                    startedAt: '2024-06-15T14:30:00.000Z',
                    source: { path: 'spec/test.spec.ts', line: 10 },
                    tags: [],
                    activities: [],
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T14:30:00.000Z', retriedAndPassed: true, retries: 1 },
                    ],
                },
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
            }),
        });

        const dot = page.locator('.exec-history-dot');
        // Should show the retry icon (↻)
        await expect(dot).toHaveText('↻');
    });
});
