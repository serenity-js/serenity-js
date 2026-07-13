import { Ensure, equals } from '@serenity-js/assertions';
import { By, PageElement } from '@serenity-js/web';

import { TestRunsView } from '../../../src/serenity/test-runs/TestRunsView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, expect, it } from '../fixtures.js';

describe('TestRunsView interaction object', () => {

    it('reports the number of test run rows', async ({ mount, actor }) => {
        await mount({
            component: 'TestRunsView',
            importPath: './components/test-runs/TestRunsView',
            props: { onNavigate: () => {} },
            data: minimalData(),
            chartJs: true,
        });

        const rootElement = PageElement.located(By.css('#app')).describedAs('test runs view');
        const view = new TestRunsView(rootElement);

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
});

describe('TestRunsView', () => {

    it('renders trend chart and run list', async ({ mount, page }) => {
        await mount({
            component: 'TestRunsView',
            importPath: './components/test-runs/TestRunsView',
            props: { onNavigate: () => {} },
            data: minimalData(),
            chartJs: true,
        });

        await expect(page.locator('body')).toContainText('Trend');
        await expect(page.locator('body')).toContainText('Test Run History');
    });

    it('shows a row for each run in history', async ({ mount, page }) => {
        await mount({
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
        });

        const rows = page.locator('.scenario-list .scenario-item');
        await expect(rows).toHaveCount(3);
    });
});
