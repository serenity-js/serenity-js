import { Ensure, equals, includes, not } from '@serenity-js/assertions';
import { ExecuteScript, LastScriptExecution } from '@serenity-js/web';

import { ExecutionHistory } from '../../../src/serenity/scenarios/ExecutionHistory.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, it } from '../fixtures.js';

function scenarioWithHistory(executionHistory: Array<{ outcome: string; run: string; timestamp?: string; retriedAndPassed?: boolean; retries?: number }>) {
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

describe('ExecutionHistory', () => {

    it('renders nothing when executionHistory is empty', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData(),
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.isPresent(), equals(false)),
        );
    });

    it('displays the section title "Execution History"', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData(),
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.title(), equals('EXECUTION HISTORY')),
        );
    });

    it('shows "X of Y passing" summary', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.summary(), includes('2 of 3 passing')),
        );
    });

    it('computes consistency as percentage of non-flipping transitions', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.summary(), includes('33% consistent')),
        );
    });

    it('shows 100% consistency when there is only one run', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.summary(), includes('100% consistent')),
        );
    });

    it('shows 100% consistency when all runs have the same outcome', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.summary(), includes('100% consistent')),
        );
    });

    it('renders a dot for each run in the execution history', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData(),
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.dotCount(), equals(2)),
        );
    });

    it('highlights the latest run as active when runIndex is null', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                ]),
                runIndex: null,
                onNavigate: () => {},
            },
            data: minimalData(),
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.activeRunCount(), equals(1)),
        );
    });

    it('highlights the specified runIndex as active', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.activeRunCount(), equals(1)),
        );
    });

    it('groups runs by date', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.dateGroupCount(), equals(2)),
        );
    });

    it('uses run labels for non-ISO run identifiers', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.runLabel(), equals('build-41')),
        );
    });

    it('navigates to the correct URL when clicking a historical run for a scenario with a browser tag', async ({ mount, page, actor }) => {
        await page.addInitScript(() => { (window as any).__onNavigate__ = (path: string) => { (window as any).navigatedTo = path; }; });

        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            view.clickRun(0),
            ExecuteScript.sync('return decodeURIComponent(window.navigatedTo)'),
            Ensure.that(LastScriptExecution.result<string>(), includes('browser=')),
            Ensure.that(LastScriptExecution.result<string>(), includes('run=2024-06-14T08:00:00.000Z')),
        );
    });

    it('navigates using the entry timestamp even when the scenario does not appear in every global run', async ({ mount, page, actor }) => {
        await page.addInitScript(() => { (window as any).__onNavigate__ = (path: string) => { (window as any).navigatedTo = path; }; });

        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            view.clickRun(0),
            ExecuteScript.sync('return decodeURIComponent(window.navigatedTo)'),
            Ensure.that(LastScriptExecution.result<string>(), includes('run=2024-06-14T10:00:00.000Z')),
            Ensure.that(LastScriptExecution.result<string>(), not(includes('run=2024-06-14T08:00:00.000Z'))),
        );
    });

    it('only considers runs up to the active runIndex for the summary', async ({ mount, actor }) => {
        const history = [
            { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
            { timestamp: '2024-06-15T10:00:00.000Z', label: '#42', outcomes: { passed: 1, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
            { timestamp: '2024-06-16T10:00:00.000Z', label: '#43', outcomes: { passed: 0, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 200, average: 200 },
        ];

        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#43', timestamp: '2024-06-16T10:00:00.000Z' },
                ]),
                runIndex: 1,
                history,
                onNavigate: () => {},
            },
            data: minimalData({ history }),
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.summary(), includes('2 of 2 passing')),
        );
    });

    it('renders a retried-success dot with the correct outcome type when retriedAndPassed is true', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.dotCount(), equals(2)),
            Ensure.that(view.dotOutcomes().as(outcomes => outcomes[0].type), not(includes('retried-success'))),
            Ensure.that(view.dotOutcomes().as(outcomes => outcomes[1].type), equals('retried-success')),
        );
    });

    it('shows "Passed on retry" tooltip for retried-success dots', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.dotOutcomes().as(outcomes => outcomes[0].title), includes('Passed on retry (attempt 2 of 2)')),
        );
    });

    it('renders retry icon in retried-success dots', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ExecutionHistory',
            importPath: './components/scenarios/ExecutionHistory',
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
            interactionObject: ExecutionHistory,
        });

        await actor.attemptsTo(
            Ensure.that(view.dotOutcomes().as(outcomes => outcomes[0].icon), equals('↻')),
        );
    });
});
