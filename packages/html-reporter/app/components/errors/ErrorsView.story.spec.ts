import { contain, Ensure, equals, includes, isPresent, not } from '@serenity-js/assertions';
import { By, PageElement, Value } from '@serenity-js/web';

import { minimalData } from '../../../spec/app/data-factories.js';
import { describe, it } from '../../../spec/app/story-fixtures.js';
import { ErrorsView } from '../../../src/serenity/errors/ErrorsView.serenity.js';

const navigatedTo = () => PageElement.located(By.css('[data-testid="navigated-to"]')).describedAs('navigated-to field');

const loginFails = {
    name: 'Login fails', category: 'Auth', outcome: 'FAILURE', duration: 50,
    startedAt: '2024-06-15T14:30:00.000Z',
    source: { path: 'spec/auth.spec.ts', line: 10 },
    tags: [], activities: [],
    executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
    error: { name: 'AssertionError', message: 'expected true to equal false' },
};

const signupFails = {
    name: 'Signup fails', category: 'Auth', outcome: 'FAILURE', duration: 60,
    startedAt: '2024-06-15T14:30:00.100Z',
    source: { path: 'spec/auth.spec.ts', line: 20 },
    tags: [], activities: [],
    executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
    error: { name: 'AssertionError', message: 'expected true to equal false' },
};

const timeoutTest = {
    name: 'Timeout test', category: 'Suite', outcome: 'FAILURE', duration: 5000,
    startedAt: '2024-06-15T14:30:00.200Z',
    source: { path: 'spec/slow.spec.ts', line: 5 },
    tags: [], activities: [],
    executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
    error: { name: 'Error', message: 'timed out after 5000ms' },
};

function errorsData() {
    return minimalData({
        scenarios: [loginFails, signupFails, timeoutTest],
        summary: {
            title: 'Test', totalScenarios: 3,
            outcomes: { passed: 0, failed: 3, pending: 0, skipped: 0, compromised: 0, error: 0 },
            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:05.000Z',
            duration: 5000, testRunner: 'Mocha',
        },
    });
}

function ungroupedErrorsData() {
    return minimalData({
        scenarios: [loginFails, timeoutTest],
        summary: {
            title: 'Test', totalScenarios: 2,
            outcomes: { passed: 0, failed: 2, pending: 0, skipped: 0, compromised: 0, error: 0 },
            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:05.000Z',
            duration: 5000, testRunner: 'Mocha',
        },
    });
}

const twoRunHistory = [
    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 100, average: 150 },
    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 1, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 200, slowest: 200, fastest: 100, average: 150 },
];

const historicalRunRoute = '#/errors?run=2024-06-14T10:00:00.000Z';

describe('ErrorsView', () => {

    it('groups scenarios with identical error messages', async ({ interactionObject, actor }) => {
        const data = errorsData();
        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/Default', {
            data, props: data,
        });

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('(×2)')),
            Ensure.that(view.bodyText(), includes('and 1 more')),
        );
    });

    it('navigates to filtered scenarios view when clicking a grouped error', async ({ interactionObject, actor }) => {
        const data = errorsData();
        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/WithNavigation', {
            data, props: { ...data, route: '#/errors' },
        });

        await actor.attemptsTo(
            view.clickFirstErrorGroup(),
            Ensure.that(Value.of(navigatedTo()), includes('/tests?search=')),
            Ensure.that(Value.of(navigatedTo()), includes('expected true to equal false')),
        );
    });

    it('navigates to scenario detail when clicking a unique error', async ({ interactionObject, actor }) => {
        const data = errorsData();
        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/WithNavigation', {
            data, props: { ...data, route: '#/errors' },
        });

        await actor.attemptsTo(
            view.clickErrorGroupContaining('timed out'),
            Ensure.that(Value.of(navigatedTo()), includes('spec/slow.spec.ts')),
        );
    });

    it('single error row does not show duplicate indicator', async ({ interactionObject, actor }) => {
        const data = errorsData();
        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/Default', {
            data, props: data,
        });

        await actor.attemptsTo(
            Ensure.that(view.errorGroupTextFor('Timeout test'), not(includes('×'))),
        );
    });

    it('shows errors from a historical run when ?run= parameter is set', async ({ interactionObject, actor }) => {
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
            history: twoRunHistory,
        });

        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/Default', {
            data, props: { ...data, route: historicalRunRoute },
        });

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('historical failure in run 41')),
            Ensure.that(view.bodyText(), not(includes('latest failure in run 42'))),
        );
    });

    it('shows "No Errors" when the selected historical run had no failures', async ({ interactionObject, actor }) => {
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

        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/Default', {
            data, props: { ...data, route: historicalRunRoute },
        });

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('No Errors')),
        );
    });

    it('can find a scenario by name', async ({ interactionObject, actor }) => {
        const data = ungroupedErrorsData();
        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/Default', {
            data, props: data,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCalled('Login fails'), isPresent()),
        );
    });

    it('can find a KPI card by its label', async ({ interactionObject, actor }) => {
        const data = ungroupedErrorsData();
        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/Default', {
            data, props: data,
        });

        await actor.attemptsTo(
            Ensure.that(view.kpiCardCalled('Errors').accessibleLabel(), includes('Errors')),
        );
    });

    it('lists visible scenario names in the errors view', async ({ interactionObject, actor }) => {
        const data = ungroupedErrorsData();
        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/Default', {
            data, props: data,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioNames(), contain('Login fails')),
        );
    });
});

describe('ErrorsView search', () => {

    it('narrows error list when searching by scenario name', async ({ interactionObject, actor }) => {
        const data = errorsData();
        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/Default', {
            data, props: data,
        });

        await actor.attemptsTo(
            view.find('Login'),
            Ensure.that(view.resultCountText(), includes('1 of 3')),
            Ensure.that(view.scenarioNames(), contain('Login fails')),
            Ensure.that(view.scenarioNames(), not(contain('Timeout test'))),
        );
    });

    it('narrows error list when searching by error message', async ({ interactionObject, actor }) => {
        const data = errorsData();
        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/Default', {
            data, props: data,
        });

        await actor.attemptsTo(
            view.find('timed out'),
            Ensure.that(view.resultCountText(), includes('1 of 3')),
            Ensure.that(view.scenarioNames(), contain('Timeout test')),
            Ensure.that(view.scenarioNames(), not(contain('Login fails'))),
        );
    });

    it('shows all errors when search is cleared', async ({ interactionObject, actor }) => {
        const data = errorsData();
        const view = await interactionObject(ErrorsView, 'components/errors/ErrorsView/Default', {
            data, props: data,
        });

        await actor.attemptsTo(
            view.find('Login'),
            Ensure.that(view.errorGroupCount(), equals(1)),
            view.searchInput.clear(),
            Ensure.that(view.errorGroupCount(), equals(2)),
        );
    });
});
