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

    test('only considers runs up to the active runIndex for the summary', async ({ mount, page }) => {
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
                onNavigate: () => {},
            },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-15T10:00:00.000Z', label: '#42', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                    { timestamp: '2024-06-16T10:00:00.000Z', label: '#43', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
                ],
            }),
        });

        const summary = page.locator('.exec-history-summary');
        // Only runs up to index 1: 2 of 2 passing
        await expect(summary).toContainText('2 of 2 passing');
    });
});
