import { and, Ensure, equals, includes } from '@serenity-js/assertions';
import { By, Click, ComputedStyle, ExecuteScript, isVisible, LastScriptExecution, PageElement } from '@serenity-js/web';

import { TestRunsView } from '../../../src/serenity/test-runs/TestRunsView.serenity.js';
import { minimalData } from '../data-factories.js';
import { describe, it } from '../fixtures.js';

const chartCanvas = () => PageElement.located(By.css('.trend-chart-container canvas')).describedAs('chart canvas');
const chartContainer = () => PageElement.located(By.css('.trend-chart-container')).describedAs('chart container');

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

    it('renders a shortened commit hash linking to the full commit URL', async ({ mount, actor }) => {
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
                        commit: 'abc1234def5678901234567890abcdef12345678',
                        repositoryUrl: 'git@github.com:serenity-js/serenity-js.git',
                    },
                ],
            }),
            chartJs: true,
            interactionObject: TestRunsView,
        });

        await actor.attemptsTo(
            Ensure.that(view.commitLinkText(), equals('abc1234')),
            Ensure.that(view.commitLinkHref(), includes('/commit/abc1234def5678901234567890abcdef12345678')),
        );
    });

    describe('chart selection interaction', () => {

        it('does not show the details panel initially', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TestRunsView',
                importPath: './components/test-runs/TestRunsView',
                props: { onNavigate: () => {} },
                data: minimalData(),
                chartJs: true,
                interactionObject: TestRunsView,
            });

            await actor.attemptsTo(
                Ensure.that(view.hasDetailsPanel(), equals(false)),
            );
        });

        it('shows the details panel when a chart bar is clicked', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TestRunsView',
                importPath: './components/test-runs/TestRunsView',
                props: { onNavigate: () => {} },
                data: minimalData(),
                chartJs: true,
                interactionObject: TestRunsView,
            });

            await actor.attemptsTo(
                view.clickChart(),
                Ensure.that(view.hasDetailsPanel(), equals(true)),
            );
        });

        it('shows run metrics in the details panel', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TestRunsView',
                importPath: './components/test-runs/TestRunsView',
                props: { onNavigate: () => {} },
                data: minimalData(),
                chartJs: true,
                interactionObject: TestRunsView,
            });

            await actor.attemptsTo(
                view.clickChart(),
                Ensure.that(view.detailsPanelText(), and(
                    includes('TOTAL'),
                    includes('PASSED'),
                    includes('FAILED'),
                    includes('SKIPPED'),
                    includes('Fastest'),
                    includes('Slowest'),
                )),
            );
        });

        it('shows the CTA button in the details panel', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TestRunsView',
                importPath: './components/test-runs/TestRunsView',
                props: { onNavigate: () => {} },
                data: minimalData(),
                chartJs: true,
                interactionObject: TestRunsView,
            });

            await actor.attemptsTo(
                view.clickChart(),
                Ensure.that(view.detailsCtaText(), includes('Open run details')),
            );
        });

        it('navigates only when CTA button is clicked', async ({ mount, page, actor }) => {
            await page.addInitScript(() => {
                (window as any).__onNavigate__ = (path: string) => {
                    (window as any).navigatedTo = path;
                };
            });

            const view = await mount({
                component: 'TestRunsView',
                importPath: './components/test-runs/TestRunsView',
                props: { onNavigate: '__onNavigate__' },
                data: minimalData(),
                chartJs: true,
                interactionObject: TestRunsView,
            });

            // Click on the chart — should NOT navigate
            await actor.attemptsTo(
                view.clickChart(),
            );

            // Verify no navigation happened after chart click
            await actor.attemptsTo(
                ExecuteScript.sync('return window.navigatedTo || null'),
                Ensure.that(LastScriptExecution.result<string | null>(), equals(null)),
            );

            // Now click the CTA button — should navigate
            await actor.attemptsTo(
                view.clickDetailsCtaButton(),
                ExecuteScript.sync('return decodeURIComponent(window.navigatedTo || \'\')'),
                Ensure.that(LastScriptExecution.result<string>(), includes('/tests?run=')),
            );
        });

        it('dismisses the panel when Escape is pressed', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TestRunsView',
                importPath: './components/test-runs/TestRunsView',
                props: { onNavigate: () => {} },
                data: minimalData(),
                chartJs: true,
                interactionObject: TestRunsView,
            });

            await actor.attemptsTo(
                view.clickChart(),
                Ensure.that(view.hasDetailsPanel(), equals(true)),
                view.dismissDetailsPanel(),
                Ensure.that(view.hasDetailsPanel(), equals(false)),
            );
        });

        it('dismisses the panel when clicking outside', async ({ mount, actor }) => {
            const view = await mount({
                component: 'TestRunsView',
                importPath: './components/test-runs/TestRunsView',
                props: { onNavigate: () => {} },
                data: minimalData(),
                chartJs: true,
                interactionObject: TestRunsView,
            });

            await actor.attemptsTo(
                view.clickChart(),
                Ensure.that(view.hasDetailsPanel(), equals(true)),
                Click.on(PageElement.located(By.css('body')).describedAs('page body')),
                Ensure.that(view.hasDetailsPanel(), equals(false)),
            );
        });
    });

    /* Implementation contract: verifies touch-action CSS property for mobile chart interaction.
       Uses ComputedStyle from @serenity-js/web rather than raw page.evaluate(). */
    describe('TestRunsView chart touch support', () => {

        it('applies touch-action pan-y to the chart canvas for mobile panning', async ({ mount, page, actor }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            await mount({
                component: 'TestRunsView',
                importPath: './components/test-runs/TestRunsView',
                props: { onNavigate: () => {} },
                data: minimalData(),
                chartJs: true,
                interactionObject: TestRunsView,
            });

            await actor.attemptsTo(
                Ensure.that(ComputedStyle.called('touch-action').of(chartCanvas()), equals('pan-y')),
            );
        });

        it('wraps the chart in a container with the trend-chart-container class', async ({ mount, actor }) => {
            await mount({
                component: 'TestRunsView',
                importPath: './components/test-runs/TestRunsView',
                props: { onNavigate: () => {} },
                data: minimalData(),
                chartJs: true,
                interactionObject: TestRunsView,
            });

            await actor.attemptsTo(
                Ensure.that(chartContainer(), isVisible()),
                Ensure.that(chartCanvas(), isVisible()),
            );
        });
    });
});
