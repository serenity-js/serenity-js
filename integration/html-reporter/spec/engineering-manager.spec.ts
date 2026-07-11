import { contain, Ensure, equals, includes, isPresent } from '@serenity-js/assertions';
import { By, Page, PageElement } from '@serenity-js/web';

import { describe, it } from '../src';
import { authFailure, degradedTest, failingTest, timeoutTest } from '../src/scenarios';

describe('Engineering Manager', () => {

    describe('Journey 9: Go/No-Go Release Decision', () => {

        it('can make a release decision from the dashboard within 30 seconds', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Confidence').value(), includes('84')),
                Ensure.that(dashboardView.kpiCardCalled('Failed').value(), includes('5')),
            );
        });

        it('can identify new failures on the dashboard', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.consistencyCardScenarioNames(), contain(failingTest)),
                Ensure.that(dashboardView.consistencyCardScenarioNames(), contain(degradedTest)),
            );
        });

        it('can assess failure impact by checking affected capabilities', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                Ensure.that(capabilitiesView.confidence(), includes('%')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('authentication')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('checkout')),
            );
        });

        it('can check error categories to identify systemic issues', async ({ actor, errorsView }) => {
            await actor.attemptsTo(
                errorsView.open(),

                Ensure.that(errorsView.scenarioCalled(timeoutTest).isPresent(), equals(true)),
                Ensure.that(errorsView.scenarioCalled(failingTest).isPresent(), equals(true)),
            );
        });

        it('can check if failing tests are known to be flaky', async ({ actor, consistencyView }) => {
            await actor.attemptsTo(
                consistencyView.open(),

                Ensure.that(consistencyView.scenarioCalled(degradedTest).isPresent(), equals(true)),
            );
        });

        it('can share the report link as evidence of the decision', async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(Page.current().url().href, includes('index.html')),
            );
        });
    });

    describe('Journey 10: Quality Trend Reporting', () => {

        it('can review quality trends across test runs', async ({ actor, testRunsView }) => {
            await actor.attemptsTo(
                testRunsView.open(),

                Ensure.that(PageElement.located(By.css('canvas')).describedAs('trend chart'), isPresent()),
                Ensure.that(testRunsView.runCount(), equals(2)),
            );
        });

        it('can check the confidence score on the dashboard', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Confidence').value(), includes('84')),
            );
        });

        it('can navigate to consistency view for stability evidence', async ({ actor, consistencyView }) => {
            await actor.attemptsTo(
                consistencyView.open(),

                Ensure.that(Page.current().url().href, includes('#/consistency')),
            );
        });
    });

    describe('Journey 11: Identify Systemic Issues', () => {

        it('can identify error patterns across failure categories', async ({ actor, errorsView }) => {
            await actor.attemptsTo(
                errorsView.open(),

                Ensure.that(errorsView.scenarioCalled(timeoutTest).isPresent(), equals(true)),
                Ensure.that(errorsView.scenarioCalled(authFailure).isPresent(), equals(true)),
            );
        });

        it('can cross-reference with tags for feature-area patterns', async ({ actor, tagsView }) => {
            await actor.attemptsTo(
                tagsView.open(),

                Ensure.that(tagsView.tagCount(), equals(7)),
            );
        });

        it('can check system context for environment details', async ({ actor, systemContextView }) => {
            await actor.attemptsTo(
                systemContextView.open(),

                Ensure.that(systemContextView.testRunner(), includes('Playwright')),
            );
        });
    });
});
