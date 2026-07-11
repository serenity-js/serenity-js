import { contain, Ensure, includes, isPresent } from '@serenity-js/assertions';
import { By, PageElement } from '@serenity-js/web';

import { describe, it } from '../src';
import { degradedTest, failingTest } from '../src/scenarios';

describe('Product Owner', () => {

    describe('Journey 1: Release Confidence Assessment', () => {

        it('can assess release confidence from the dashboard KPIs', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Pass Rate').value(), includes('75')),
                Ensure.that(dashboardView.kpiCardCalled('Confidence').value(), includes('84')),
                Ensure.that(dashboardView.kpiCardCalled('Failed').value(), includes('5')),
            );
        });

        it('can see the consistency score on the dashboard', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Consistency').value(), includes('80')),
            );
        });

        it('can see sub-KPI context via card subtitles', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.kpiCardCalled('Pass Rate').subtitle(), includes('passing')),
            );
        });

        it('can identify newly failing tests on the dashboard', async ({ actor, dashboardView }) => {
            await actor.attemptsTo(
                Ensure.that(dashboardView.consistencyCardScenarioNames(), contain(failingTest)),
                Ensure.that(dashboardView.consistencyCardScenarioNames(), contain(degradedTest)),
            );
        });

        it('can navigate to capabilities to understand which features are affected', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                Ensure.that(capabilitiesView.confidence(), includes('%')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('authentication')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('checkout')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('todo')),
            );
        });

        it('can validate the quality trend across runs', async ({ actor }) => {
            await actor.attemptsTo(
                Ensure.that(PageElement.located(By.css('canvas')).describedAs('trend chart'), isPresent()),
            );
        });
    });

    describe('Journey 2: Capability Health Review', () => {

        it('can review capability health to understand feature coverage', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                Ensure.that(capabilitiesView.confidence(), includes('%')),
                Ensure.that(capabilitiesView.scenarioCount(), includes('20')),
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('todo')),
            );
        });

        it('can drill into failing scenarios within a capability', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                // The weakest capability (todo) is visible in the detail panel children
                Ensure.that(capabilitiesView.childCapabilityNames(), contain('todo')),
                Ensure.that(capabilitiesView.scenarioCount(), includes('scenario')),
            );
        });
    });
});
