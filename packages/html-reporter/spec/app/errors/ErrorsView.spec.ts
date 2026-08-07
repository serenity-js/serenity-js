import { contain, Ensure, equals, includes, not } from '@serenity-js/assertions';
import { ExecuteScript, LastScriptExecution } from '@serenity-js/web';

import { ErrorsView } from '../../../src/serenity/errors/ErrorsView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, it } from '../fixtures.js';

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

function ungroupedErrorsData() {
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
                name: 'Timeout test', category: 'Suite', outcome: 'FAILURE', duration: 5000,
                startedAt: '2024-06-15T14:30:00.200Z',
                source: { path: 'spec/slow.spec.ts', line: 5 },
                tags: [], activities: [],
                executionHistory: [{ outcome: 'FAILURE', run: '#42' }],
                error: { name: 'Error', message: 'timed out after 5000ms' },
            },
        ],
        summary: {
            title: 'Test', totalScenarios: 2,
            outcomes: { passed: 0, failed: 2, pending: 0, skipped: 0, compromised: 0, error: 0 },
            startedAt: '2024-06-15T14:30:00.000Z', finishedAt: '2024-06-15T14:30:05.000Z',
            duration: 5000, testRunner: 'Mocha',
        },
    });
}

describe('ErrorsView', () => {

    it('groups scenarios with identical error messages', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ErrorsView',
            importPath: './components/errors/ErrorsView',
            props: { onNavigate: () => {}, route: '#/errors' },
            data: errorsData(),
            interactionObject: ErrorsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('(×2)')),
            Ensure.that(view.bodyText(), includes('and 1 more')),
        );
    });

    it('navigates to filtered scenarios view when clicking a grouped error', async ({ mount, page, actor }) => {
        await page.addInitScript(() => { (window as any).__onNavigate__ = (path: string) => { (window as any).navigatedTo = path; }; });

        const view = await mount({
            component: 'ErrorsView',
            importPath: './components/errors/ErrorsView',
            props: { onNavigate: '__onNavigate__', route: '#/errors' },
            data: errorsData(),
            interactionObject: ErrorsView,
        });

        await actor.attemptsTo(
            view.clickFirstErrorGroup(),
            ExecuteScript.sync('return decodeURIComponent(window.navigatedTo || \'\')'),
            Ensure.that(LastScriptExecution.result<string>(), includes('/tests?search=')),
            Ensure.that(LastScriptExecution.result<string>(), includes('expected true to equal false')),
        );
    });

    it('navigates to scenario detail when clicking a unique error', async ({ mount, page, actor }) => {
        await page.addInitScript(() => { (window as any).__onNavigate__ = (path: string) => { (window as any).navigatedTo = path; }; });

        const view = await mount({
            component: 'ErrorsView',
            importPath: './components/errors/ErrorsView',
            props: { onNavigate: '__onNavigate__', route: '#/errors' },
            data: errorsData(),
            interactionObject: ErrorsView,
        });

        await actor.attemptsTo(
            view.clickErrorGroupContaining('timed out'),
            ExecuteScript.sync('return decodeURIComponent(window.navigatedTo || \'\')'),
            Ensure.that(LastScriptExecution.result<string>(), includes('spec/slow.spec.ts')),
        );
    });

    it('single error row does not show duplicate indicator', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ErrorsView',
            importPath: './components/errors/ErrorsView',
            props: { onNavigate: () => {}, route: '#/errors' },
            data: errorsData(),
            interactionObject: ErrorsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.errorGroupTextFor('Timeout test'), not(includes('×'))),
        );
    });

    it('shows errors from a historical run when ?run= parameter is set', async ({ mount, actor }) => {
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

        const view = await mount({
            component: 'ErrorsView',
            importPath: './components/errors/ErrorsView',
            props: { onNavigate: () => {}, route: '#/errors?run=2024-06-14T10:00:00.000Z' },
            data,
            interactionObject: ErrorsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('historical failure in run 41')),
            Ensure.that(view.bodyText(), not(includes('latest failure in run 42'))),
        );
    });

    it('shows "No Errors" when the selected historical run had no failures', async ({ mount, actor }) => {
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

        const view = await mount({
            component: 'ErrorsView',
            importPath: './components/errors/ErrorsView',
            props: { onNavigate: () => {}, route: '#/errors?run=2024-06-14T10:00:00.000Z' },
            data,
            interactionObject: ErrorsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('No Errors')),
        );
    });

    it('can find a scenario by name', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ErrorsView',
            importPath: './components/errors/ErrorsView',
            props: { onNavigate: () => {}, route: '/errors' },
            data: ungroupedErrorsData(),
            interactionObject: ErrorsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioCalled('Login fails').isPresent(), equals(true)),
        );
    });

    it('can find a KPI card by its label', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ErrorsView',
            importPath: './components/errors/ErrorsView',
            props: { onNavigate: () => {}, route: '/errors' },
            data: ungroupedErrorsData(),
            interactionObject: ErrorsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.kpiCardCalled('Errors').accessibleLabel(), includes('Errors')),
        );
    });

    it('lists visible scenario names in the errors view', async ({ mount, actor }) => {
        const view = await mount({
            component: 'ErrorsView',
            importPath: './components/errors/ErrorsView',
            props: { onNavigate: () => {}, route: '/errors' },
            data: ungroupedErrorsData(),
            interactionObject: ErrorsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.scenarioNames(), contain('Login fails')),
        );
    });
});
