import { Ensure, equals, includes, isPresent, not } from '@serenity-js/assertions';
import { By, PageElement, Value } from '@serenity-js/web';

import { minimalData } from '../../../spec/app/data-factories.js';
import { describe, it } from '../../../spec/app/story-fixtures.js';
import { ExecutionHistory } from '../../../src/serenity/scenarios/ExecutionHistory.serenity.js';

const navigatedTo = () => PageElement.located(By.css('[data-testid="navigated-to"]')).describedAs('navigated-to field');

const executionHistoryStory = 'components/scenarios/ExecutionHistory/Default';

const baseScenarioFields = {
    name: 'Test Scenario',
    category: 'Suite',
    duration: 200,
    startedAt: '2024-06-15T14:30:00.000Z',
    source: { path: 'spec/test.spec.ts', line: 10 },
    tags: [],
    activities: [],
};

const defaultRunOutcomes = { passed: 0, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 };

function historyEntry(overrides: { timestamp: string; label: string; passed?: number; failed?: number }) {
    return {
        timestamp: overrides.timestamp,
        label: overrides.label,
        outcomes: { ...defaultRunOutcomes, passed: overrides.passed ?? 0, failed: overrides.failed ?? 0 },
        duration: 200,
        slowest: 200,
        fastest: 200,
        average: 200,
    };
}

function scenarioWithHistory(executionHistory: Array<{ outcome: string; run: string; timestamp?: string; retriedAndPassed?: boolean; retries?: number }>) {
    return {
        ...baseScenarioFields,
        outcome: executionHistory[executionHistory.length - 1]?.outcome || 'SUCCESS',
        executionHistory,
    };
}

describe('ExecutionHistory', () => {

    it('renders nothing when executionHistory is empty', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([]),
                runIndex: null,
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            Ensure.that(view, not(isPresent())),
        );
    });

    it('displays the section title "Execution History"', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                ]),
                runIndex: null,

            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            Ensure.that(view.title(), equals('EXECUTION HISTORY')),
        );
    });

    it('shows "X of Y passing" summary', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#43', timestamp: '2024-06-16T10:00:00.000Z' },
                ]),
                runIndex: null,

            },
            data: minimalData({
                history: [
                    historyEntry({ timestamp: '2024-06-14T10:00:00.000Z', label: '#41', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-15T10:00:00.000Z', label: '#42', failed: 1 }),
                    historyEntry({ timestamp: '2024-06-16T10:00:00.000Z', label: '#43', passed: 1 }),
                ],
            }),
        });

        await actor.attemptsTo(
            Ensure.that(view.summary(), includes('2 of 3 passing')),
        );
    });

    it('computes consistency as percentage of non-flipping transitions', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#43', timestamp: '2024-06-16T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#44', timestamp: '2024-06-17T10:00:00.000Z' },
                ]),
                runIndex: null,

            },
            data: minimalData({
                history: [
                    historyEntry({ timestamp: '2024-06-14T10:00:00.000Z', label: '#41', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-15T10:00:00.000Z', label: '#42', failed: 1 }),
                    historyEntry({ timestamp: '2024-06-16T10:00:00.000Z', label: '#43', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-17T10:00:00.000Z', label: '#44', passed: 1 }),
                ],
            }),
        });

        await actor.attemptsTo(
            Ensure.that(view.summary(), includes('33% consistent')),
        );
    });

    it('shows 100% consistency when there is only one run', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                ]),
                runIndex: null,

            },
            data: minimalData({
                history: [
                    historyEntry({ timestamp: '2024-06-14T10:00:00.000Z', label: '#41', passed: 1 }),
                ],
            }),
        });

        await actor.attemptsTo(
            Ensure.that(view.summary(), includes('100% consistent')),
        );
    });

    it('shows 100% consistency when all runs have the same outcome', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#43', timestamp: '2024-06-16T10:00:00.000Z' },
                ]),
                runIndex: null,

            },
            data: minimalData({
                history: [
                    historyEntry({ timestamp: '2024-06-14T10:00:00.000Z', label: '#41', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-15T10:00:00.000Z', label: '#42', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-16T10:00:00.000Z', label: '#43', passed: 1 }),
                ],
            }),
        });

        await actor.attemptsTo(
            Ensure.that(view.summary(), includes('100% consistent')),
        );
    });

    it('renders a dot for each run in the execution history', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                ]),
                runIndex: null,

            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            Ensure.that(view.dotCount(), equals(2)),
        );
    });

    it('highlights the latest run as active when runIndex is null', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                ]),
                runIndex: null,

            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            Ensure.that(view.activeRunCount(), equals(1)),
        );
    });

    it('highlights the specified runIndex as active', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#42', timestamp: '2024-06-15T14:30:00.000Z' },
                ]),
                runIndex: 0,
                history: [
                    historyEntry({ timestamp: '2024-06-14T10:00:00.000Z', label: '#41', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-15T14:30:00.000Z', label: '#42', failed: 1 }),
                ],

            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            Ensure.that(view.activeRunCount(), equals(1)),
        );
    });

    it('groups runs by date', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-14T14:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#43', timestamp: '2024-06-15T10:00:00.000Z' },
                ]),
                runIndex: null,

            },
            data: minimalData({
                history: [
                    historyEntry({ timestamp: '2024-06-14T10:00:00.000Z', label: '#41', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-14T14:00:00.000Z', label: '#42', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-15T10:00:00.000Z', label: '#43', failed: 1 }),
                ],
            }),
        });

        await actor.attemptsTo(
            Ensure.that(view.dateGroupCount(), equals(2)),
        );
    });

    it('uses run labels for non-ISO run identifiers', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: 'build-41', timestamp: '2024-06-14T10:00:00.000Z' },
                ]),
                runIndex: null,

            },
            data: minimalData({
                history: [
                    historyEntry({ timestamp: '2024-06-14T10:00:00.000Z', label: 'build-41', passed: 1 }),
                ],
            }),
        });

        await actor.attemptsTo(
            Ensure.that(view.runLabel(), equals('build-41')),
        );
    });

    it('navigates to the correct URL when clicking a historical run for a scenario with a browser tag', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, 'components/scenarios/ExecutionHistory/WithNavigation', {
            props: {
                scenario: {
                    ...baseScenarioFields,
                    outcome: 'SUCCESS',
                    tags: [{ type: 'browser', name: 'chrome 129.0.6668.100' }],
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#8213', timestamp: '2024-06-14T08:00:00.000Z' },
                        { outcome: 'SUCCESS', run: '#8214', timestamp: '2024-06-14T10:00:00.000Z' },
                        { outcome: 'SUCCESS', run: '#8219', timestamp: '2024-06-15T14:30:00.000Z' },
                    ],
                },
                runIndex: null,
                history: [
                    historyEntry({ timestamp: '2024-06-14T08:00:00.000Z', label: '#8213', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-14T10:00:00.000Z', label: '#8214', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-15T14:30:00.000Z', label: '#8219', passed: 1 }),
                ],
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.clickRun(0),
            Ensure.that(Value.of(navigatedTo()), includes('browser=')),
            Ensure.that(Value.of(navigatedTo()), includes('run=2024-06-14T08:00:00.000Z')),
        );
    });

    it('navigates using the entry timestamp even when the scenario does not appear in every global run', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, 'components/scenarios/ExecutionHistory/WithNavigation', {
            props: {
                scenario: {
                    ...baseScenarioFields,
                    outcome: 'SUCCESS',
                    tags: [{ type: 'browser', name: 'chrome 129.0.6668.100' }],
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#8214', timestamp: '2024-06-14T10:00:00.000Z' },
                        { outcome: 'SUCCESS', run: '#8219', timestamp: '2024-06-15T14:30:00.000Z' },
                    ],
                },
                runIndex: null,
                history: [
                    historyEntry({ timestamp: '2024-06-14T08:00:00.000Z', label: '#8213', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-14T10:00:00.000Z', label: '#8214', passed: 1 }),
                    historyEntry({ timestamp: '2024-06-15T14:30:00.000Z', label: '#8219', passed: 1 }),
                ],
            },
            data: minimalData(),
        });

        await actor.attemptsTo(
            view.clickRun(0),
            Ensure.that(Value.of(navigatedTo()), includes('run=2024-06-14T10:00:00.000Z')),
            Ensure.that(Value.of(navigatedTo()), not(includes('run=2024-06-14T08:00:00.000Z'))),
        );
    });

    it('only considers runs up to the active runIndex for the summary', async ({ interactionObject, actor }) => {
        const history = [
            historyEntry({ timestamp: '2024-06-14T10:00:00.000Z', label: '#41', passed: 1 }),
            historyEntry({ timestamp: '2024-06-15T10:00:00.000Z', label: '#42', passed: 1 }),
            historyEntry({ timestamp: '2024-06-16T10:00:00.000Z', label: '#43', failed: 1 }),
        ];

        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: scenarioWithHistory([
                    { outcome: 'SUCCESS', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                    { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T10:00:00.000Z' },
                    { outcome: 'FAILURE', run: '#43', timestamp: '2024-06-16T10:00:00.000Z' },
                ]),
                runIndex: 1,
                history,

            },
            data: minimalData({ history }),
        });

        await actor.attemptsTo(
            Ensure.that(view.summary(), includes('2 of 2 passing')),
        );
    });

    it('renders a retried-success dot with the correct outcome type when retriedAndPassed is true', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: {
                    ...baseScenarioFields,
                    outcome: 'SUCCESS',
                    duration: 500,
                    executionHistory: [
                        { outcome: 'FAILURE', run: '#41', timestamp: '2024-06-14T10:00:00.000Z' },
                        { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T14:30:00.000Z', retriedAndPassed: true, retries: 1 },
                    ],
                },
                runIndex: null,

            },
            data: minimalData({
                history: [
                    historyEntry({ timestamp: '2024-06-14T10:00:00.000Z', label: '#41', failed: 1 }),
                    historyEntry({ timestamp: '2024-06-15T14:30:00.000Z', label: '#42', passed: 1 }),
                ],
            }),
        });

        await actor.attemptsTo(
            Ensure.that(view.dotCount(), equals(2)),
            Ensure.that(view.dotOutcomes().as(outcomes => outcomes[0].type), not(includes('retried-success'))),
            Ensure.that(view.dotOutcomes().as(outcomes => outcomes[1].type), equals('retried-success')),
        );
    });

    it('shows "Passed on retry" tooltip for retried-success dots', async ({ interactionObject, actor }) => {
        const retriedScenarioProps = {
            scenario: {
                ...baseScenarioFields,
                outcome: 'SUCCESS',
                duration: 500,
                executionHistory: [
                    { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T14:30:00.000Z', retriedAndPassed: true, retries: 1 },
                ],
            },
            runIndex: null,
        };
        const retriedHistoryData = minimalData({
            history: [
                historyEntry({ timestamp: '2024-06-15T14:30:00.000Z', label: '#42', passed: 1 }),
            ],
        });

        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: retriedScenarioProps,
            data: retriedHistoryData,
        });

        await actor.attemptsTo(
            Ensure.that(view.dotOutcomes().as(outcomes => outcomes[0].title), includes('Passed on retry (attempt 2 of 2)')),
        );
    });

    it('renders retry icon in retried-success dots', async ({ interactionObject, actor }) => {
        const view = await interactionObject(ExecutionHistory, executionHistoryStory, {
            props: {
                scenario: {
                    ...baseScenarioFields,
                    outcome: 'SUCCESS',
                    duration: 500,
                    executionHistory: [
                        { outcome: 'SUCCESS', run: '#42', timestamp: '2024-06-15T14:30:00.000Z', retriedAndPassed: true, retries: 1 },
                    ],
                },
                runIndex: null,

            },
            data: minimalData({
                history: [
                    historyEntry({ timestamp: '2024-06-15T14:30:00.000Z', label: '#42', passed: 1 }),
                ],
            }),
        });

        await actor.attemptsTo(
            Ensure.that(view.dotOutcomes().as(outcomes => outcomes[0].icon), equals('↻')),
        );
    });
});
