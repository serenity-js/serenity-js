import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, when } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { CorrelationId, ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    when(cucumberVersion().major() <= 6)
        .it('recognises Screenplay activities in any part of the Cucumber scenario (cucumber <= 6)', () =>
            cucumber('features/screenplay_scenario.feature', 'screenplay.steps.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(0);

                    let currentSceneId: CorrelationId;

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => {
                            expect(event.details.name).to.equal(new Name('A screenplay scenario'));
                            currentSceneId = event.sceneId;
                        })
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises Screenplay activities')))
                        // before step
                        .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara makes an arrow')))
                        .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara makes an arrow')))
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
                        .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara retrieves the arrow from the target')))
                        .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara retrieves the arrow from the target')))
                        .next(SceneFinishes,       event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(SceneFinished,       event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.equal(new ExecutionSuccessful())
                        })
                    ;
                })
        );

    when(7 <= cucumberVersion().major())
        .it('recognises Screenplay activities in any part of the Cucumber scenario (7 <= cucumber', () =>
            cucumber('features/screenplay_scenario.feature', 'screenplay.steps.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(0);

                    let currentSceneId: CorrelationId;

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => {
                            expect(event.details.name).to.equal(new Name('A screenplay scenario'));
                            currentSceneId = event.sceneId;
                        })
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
                        .next(SceneFinishes,       event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(SceneFinished,       event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.equal(new ExecutionSuccessful())
                        })
                    ;
                })
        );
});
