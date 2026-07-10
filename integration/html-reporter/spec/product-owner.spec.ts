import { Ensure, includes, isPresent } from '@serenity-js/assertions';
import { Task } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';

import { describe, it } from '../src';

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

        it('can identify newly failing tests on the dashboard', async ({ actor }) => {
            await actor.attemptsTo(
                // TODO: implement dashboardView.consistencyCard().scenarioNames()
                Task.where('#actor reviews the degraded tests section on the dashboard'),
            );
        });

        it('can navigate to capabilities to understand which features are affected', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                // TODO: implement capabilitiesView.selectedCapability().confidence()
                Task.where('#actor reviews capability confidence scores to identify affected features'),
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

                // TODO: implement capabilitiesView.selectedCapability().confidence()
                // TODO: implement capabilitiesView.selectedCapability().children()
                Task.where('#actor reviews capability tree for health indicators and confidence scores'),
            );
        });

        it('can drill into failing scenarios within a capability', async ({ actor, capabilitiesView }) => {
            await actor.attemptsTo(
                capabilitiesView.open(),

                // TODO: implement capabilitiesView.selectCapability('todo')
                Task.where('#actor selects the weakest capability to see its failing scenarios'),
            );
        });
    });
});
