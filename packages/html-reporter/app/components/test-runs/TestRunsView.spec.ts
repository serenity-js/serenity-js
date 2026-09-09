import { and, Ensure, equals, includes } from '@serenity-js/assertions';
import { describe, it } from '@serenity-js/playwright-test';
import { Attribute, By, Click, ComputedStyle, isVisible, PageElement, Value } from '@serenity-js/web';

import { minimalData } from '../../../spec/app/data-factories.js';
import { TestRunsView } from '../../../src/serenity/test-runs/TestRunsView.serenity.js';

const chartCanvas = () => PageElement.located(By.css('.trend-chart-container canvas')).describedAs('chart canvas');
const chartContainer = () => PageElement.located(By.css('.trend-chart-container')).describedAs('chart container');
const navigatedTo = () => PageElement.located(By.css('[data-testid="navigated-to"]')).describedAs('navigated-to field');

describe('TestRunsView', () => {

    it('reports the number of test run rows', async ({ story, actor }) => {
        const props = minimalData();
        const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

        await actor.attemptsTo(
            Ensure.that(view.runCount(), equals(2)),
        );
    });

    it('reports whether a trend chart is present', async ({ story, actor }) => {
        const props = minimalData();
        const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

        await actor.attemptsTo(
            Ensure.that(view.hasTrendChart(), equals(true)),
        );
    });

    it('allows selecting a run entry', async ({ story, actor }) => {
        const props = minimalData();
        const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

        await actor.attemptsTo(
            view.selectRun(0),
        );
        // Test passes if the run was found and clicked without throwing
    });

    it('renders trend chart and run list', async ({ story, actor }) => {
        const props = minimalData();
        const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

        await actor.attemptsTo(
            Ensure.that(view.bodyText(), includes('TREND')),
            Ensure.that(view.bodyText(), includes('TEST RUN HISTORY')),
        );
    });

    it('shows a row for each run in history', async ({ story, actor }) => {
        const props = minimalData({
            history: [
                { timestamp: '2024-06-14T10:00:00.000Z', label: '#41', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 800, slowest: 300, fastest: 100, average: 200 },
                { timestamp: '2024-06-15T14:30:00.000Z', label: '#42', outcomes: { passed: 3, failed: 1, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 1000, slowest: 400, fastest: 100, average: 250 },
                { timestamp: '2024-06-16T09:00:00.000Z', label: '#43', outcomes: { passed: 4, failed: 0, pending: 0, skipped: 0, compromised: 0, error: 0 }, duration: 900, slowest: 350, fastest: 100, average: 225 },
            ],
        });

        const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

        await actor.attemptsTo(
            Ensure.that(view.runCount(), equals(3)),
        );
    });

    it('renders a shortened commit hash linking to the full commit URL', async ({ story, actor }) => {
        const props = minimalData({
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
        });

        const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

        await actor.attemptsTo(
            Ensure.that(view.commitLinkText(), equals('abc1234')),
            Ensure.that(view.commitLinkHref(), includes('/commit/abc1234def5678901234567890abcdef12345678')),
        );
    });

    describe('chart selection interaction', () => {

        it('does not show the details panel initially', async ({ story, actor }) => {
            const props = minimalData();
            const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

            await actor.attemptsTo(
                Ensure.that(view.hasDetailsPanel(), equals(false)),
            );
        });

        it('shows the details panel when a chart bar is clicked', async ({ story, actor }) => {
            const props = minimalData();
            const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

            await actor.attemptsTo(
                view.clickChart(),
                Ensure.that(view.hasDetailsPanel(), equals(true)),
            );
        });

        it('shows run metrics in the details panel', async ({ story, actor }) => {
            const props = minimalData();
            const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

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

        it('shows the CTA button in the details panel', async ({ story, actor }) => {
            const props = minimalData();
            const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

            await actor.attemptsTo(
                view.clickChart(),
                Ensure.that(view.detailsCtaText(), includes('Show test scenarios')),
            );
        });

        it('navigates only when CTA button is clicked', async ({ story, actor }) => {
            const props = minimalData();
            const view = story('components/test-runs/TestRunsView/WithNavigation', props).as(TestRunsView);

            // Click on the chart — should NOT navigate
            await actor.attemptsTo(
                view.clickChart(),
            );

            // Verify no navigation happened after chart click
            await actor.attemptsTo(
                Ensure.that(Value.of(navigatedTo()), equals('')),
            );

            // Now click the CTA button — should navigate
            await actor.attemptsTo(
                view.clickDetailsCtaButton(),
                Ensure.that(Value.of(navigatedTo()), includes('/tests?run=')),
            );
        });

        it('dismisses the panel when Escape is pressed', async ({ story, actor }) => {
            const props = minimalData();
            const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

            await actor.attemptsTo(
                view.clickChart(),
                Ensure.that(view.hasDetailsPanel(), equals(true)),
                view.dismissDetailsPanel(),
                Ensure.that(view.hasDetailsPanel(), equals(false)),
            );
        });

        it('dismisses the panel when clicking outside', async ({ story, actor }) => {
            const props = minimalData();
            const view = story('components/test-runs/TestRunsView/Default', props).as(TestRunsView);

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

        it('applies touch-action pan-y to the chart canvas for mobile panning', async ({ story, page, actor }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const props = minimalData();
            await actor.answer(story('components/test-runs/TestRunsView/Default', props).as(TestRunsView));

            await actor.attemptsTo(
                Ensure.that(ComputedStyle.called('touch-action').of(chartCanvas()), equals('pan-y')),
            );
        });

        it('wraps the chart in a container with the trend-chart-container class', async ({ story, actor }) => {
            const props = minimalData();
            await actor.answer(story('components/test-runs/TestRunsView/Default', props).as(TestRunsView));

            await actor.attemptsTo(
                Ensure.that(chartContainer(), isVisible()),
                Ensure.that(chartCanvas(), isVisible()),
            );
        });
    });

    /* Regression: TrendChart must initialise its theme from the data-theme DOM attribute,
       not from localStorage (which is null for "system" preference users). Without this,
       chart labels render with light-theme colours on a dark background — invisible. */
    describe('TestRunsView chart theme initialisation', () => {

        it('uses dark chart theme when data-theme is dark', async ({ story, actor }) => {
            const props = minimalData();
            await actor.answer(story('components/test-runs/TestRunsView/Default', { ...props, theme: 'dark' }).as(TestRunsView));

            await actor.attemptsTo(
                Ensure.that(Attribute.called('data-chart-theme').of(chartContainer()), equals('dark')),
            );
        });

        it('uses light chart theme when data-theme is light', async ({ story, actor }) => {
            const props = minimalData();
            await actor.answer(story('components/test-runs/TestRunsView/Default', { ...props, theme: 'light' }).as(TestRunsView));

            await actor.attemptsTo(
                Ensure.that(Attribute.called('data-chart-theme').of(chartContainer()), equals('light')),
            );
        });
    });
});
