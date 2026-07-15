import { Ensure, equals, includes } from '@serenity-js/assertions';

import { TestRunsView } from '../../../src/serenity/test-runs/TestRunsView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, it } from '../fixtures.js';

describe('TestRunsView', () => {

    it('reports the number of test run rows', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TestRunsView',
            importPath: './components/test-runs/TestRunsView',
            props: { onNavigate: () => {} },
            data: minimalData(),
            chartJs: true,
            interactionObject: TestRunsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.runCount(), equals(2)),
        );
    });

    it('reports whether a trend chart is present', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TestRunsView',
            importPath: './components/test-runs/TestRunsView',
            props: { onNavigate: () => {} },
            data: minimalData(),
            chartJs: true,
            interactionObject: TestRunsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.hasTrendChart(), equals(true)),
        );
    });

    it('allows selecting a run entry', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TestRunsView',
            importPath: './components/test-runs/TestRunsView',
            props: { onNavigate: () => {} },
            data: minimalData(),
            chartJs: true,
            interactionObject: TestRunsView,
        });

        await actor.attemptsTo(
            view.selectRun(0),
        );
        // Test passes if the run was found and clicked without throwing
    });

    it('renders trend chart and run list', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TestRunsView',
            importPath: './components/test-runs/TestRunsView',
            props: { onNavigate: () => {} },
            data: minimalData(),
            chartJs: true,
            interactionObject: TestRunsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('TREND')),
            Ensure.that(view.bodyText(), includes('TEST RUN HISTORY')),
        );
    });

    it('shows a row for each run in history', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TestRunsView',
            importPath: './components/test-runs/TestRunsView',
            props: { onNavigate: () => {} },
            data: minimalData({
                history: [
                    { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 800, slowest: 300, fastest: 100, average: 200 },
                    { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 1000, slowest: 400, fastest: 100, average: 250 },
                    { timestamp: '2024-06-16T09:00:00.000Z', label: '#43', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 900, slowest: 350, fastest: 100, average: 225 },
                ],
            }),
            chartJs: true,
            interactionObject: TestRunsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.runCount(), equals(3)),
        );
    });

    it('renders branch and commit as links to the repository', async ({ mount, actor }) => {
        const view = await mount({
            component: 'TestRunsView',
            importPath: './components/test-runs/TestRunsView',
            props: { onNavigate: () => {} },
            data: minimalData({
                history: [
                    {
                        timestamp: '2024-06-15T14:30:00.000Z', label: '#42',
                        outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 },
                        duration: 1000, slowest: 400, fastest: 100, average: 250,
                        branch: 'main',
                        commit: 'abc1234',
                        repositoryUrl: 'git@github.com:serenity-js/serenity-js.git',
                    },
                ],
            }),
            chartJs: true,
            interactionObject: TestRunsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.branchLinkText(), equals('main')),
            Ensure.that(view.branchLinkHref(), includes('/tree/main')),
            Ensure.that(view.commitLinkText(), equals('abc1234')),
            Ensure.that(view.commitLinkHref(), includes('/commit/abc1234')),
        );
    });
});
