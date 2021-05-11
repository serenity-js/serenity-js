/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', () => {

    describe('when working with Cucumber 7', () => {

        it('recognises Screenplay activities in any part of a Cucumber scenario', () =>

            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/screenplay.steps.ts',
                './examples/features/screenplay_scenario.feature',
            )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises Screenplay activities')))
                    // before
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Before')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara makes an arrow')))
                    .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara makes an arrow')))
                    .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Before')))
                    // when step
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('When Lara shoots an arrow')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara fits an arrow to the bowstring')))
                    .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara fits an arrow to the bowstring')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara draws the bow')))
                    .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara draws the bow')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara releases the bowstring')))
                    .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara releases the bowstring')))
                    .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('When Lara shoots an arrow')))
                    // then step
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Then she should hit a target')))
                    .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Then she should hit a target')))
                    // after
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('After')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara retrieves the arrow from the target')))
                    .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara retrieves the arrow from the target')))
                    .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('After')))
                    .next(SceneFinishes,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                ;
            }));
    });
});
