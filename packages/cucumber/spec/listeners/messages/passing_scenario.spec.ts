/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import {
    ActivityFinished,
    ActivityStarts,
    SceneFinished, SceneFinishes,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
} from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, FeatureTag, Name, Timestamp } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', () => {

    describe('when working with Cucumber 7', () => {

        it('recognises passing scenarios', () =>

            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/common.steps.ts',
                './examples/features/passing_scenario.feature',
            )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('A passing scenario'))
                        expect(event.details.location.path.value).to.match(/examples\/features\/passing_scenario.feature$/)
                        expect(event.details.location.line).to.equal(3);
                        expect(event.details.location.column).to.equal(3);
                    })
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('A passing feature')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(SceneFinishes,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;
            }));
    });
});
