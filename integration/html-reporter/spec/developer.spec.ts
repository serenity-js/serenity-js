import { contain, Ensure, equals, includes, isGreaterThan } from '@serenity-js/assertions';
import { Task } from '@serenity-js/core';

import { describe, it } from '../src';
import { degradedTest, failingTest, timeoutTest } from '../src/scenarios';

describe('Developer', () => {

    describe('Journey 3: Diagnose a Failing Test', () => {

        it('can locate a failing test by filtering and searching', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.filterBar.selectFilter('Failed'),
                scenariosView.find('expired card'),

                Ensure.that(scenariosView.scenarioCalled(failingTest).isPresent(), equals(true)),
                Ensure.that(scenariosView.scenarioCalled(failingTest).outcome(), equals('FAILURE')),
                Ensure.that(scenariosView.scenarioCalled(failingTest).sourceLocation(), includes('checkout.spec.ts')),
            );
        });

        it('can identify the failing step and error message', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.filterBar.selectFilter('Failed'),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                Ensure.that(scenarioDetailView.errorBlock().message(), includes('Payment rejected')),
                Ensure.that(scenarioDetailView.activityCalled('submits the payment').outcome(), equals('FAILURE')),
            );
        });

        it('can see the error preview inline in the scenario list', async ({ actor, scenariosView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.filterBar.selectFilter('Failed'),
                scenariosView.find('expired card'),

                Ensure.that(scenariosView.scenarioCalled(failingTest).errorPreview(), includes('Payment rejected')),
            );
        });

        it('can inspect execution history to assess flakiness', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                Ensure.that(scenarioDetailView.executionHistoryDotCount(), isGreaterThan(1)),
            );
        });

        it('can inspect a screenshot at the point of failure', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                // TODO: implement photo strip / lightbox interaction object
                Task.where('#actor reviews the screenshot at point of failure'),
            );
        });

        it('can copy the source location for the failing test', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('expired card'),
                scenariosView.scenarioCalled(failingTest).viewDetails(),

                // TODO: implement copy-to-clipboard interaction
                Task.where('#actor copies the source location to clipboard'),
            );
        });
    });

    describe('Journey 4: Determine if Failure is Flaky', () => {

        it('can find inconsistent tests in the consistency view', async ({ actor, consistencyView }) => {
            await actor.attemptsTo(
                consistencyView.open(),

                Ensure.that(consistencyView.scenarioNames(), contain(degradedTest)),
                Ensure.that(consistencyView.scenarioNames(), contain(failingTest)),
            );
        });

        it('can drill into a flaky scenario to understand the failure mode', async ({ actor, consistencyView, scenarioDetailView }) => {
            await actor.attemptsTo(
                consistencyView.open(),
                consistencyView.scenarioCalled(degradedTest).viewDetails(),

                Ensure.that(scenarioDetailView.hasError(), equals(true)),
            );
        });
    });

    describe('Journey 5: Investigate a Timeout Failure', () => {

        it('can identify a timeout failure and understand its cause', async ({ actor, scenariosView, scenarioDetailView }) => {
            await actor.attemptsTo(
                scenariosView.open(),
                scenariosView.find('timeout error'),
                scenariosView.scenarioCalled(timeoutTest).viewDetails(),

                Ensure.that(scenarioDetailView.errorBlock().name(), includes('Error')),
                Ensure.that(scenarioDetailView.errorBlock().message(), includes('Timeout')),
            );
        });

        it('can find timeout errors grouped in the Errors view', async ({ actor, errorsView }) => {
            await actor.attemptsTo(
                errorsView.open(),

                Ensure.that(errorsView.scenarioCalled(timeoutTest).isPresent(), equals(true)),
                Ensure.that(errorsView.scenarioCalled(failingTest).isPresent(), equals(true)),
            );
        });
    });
});
