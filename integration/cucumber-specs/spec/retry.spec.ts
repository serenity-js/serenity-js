import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, when } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import {
    ActivityFinished,
    ActivityStarts,
    RetryableSceneDetected,
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunStarts,
} from '@serenity-js/core/lib/events';
import { ArbitraryTag, CorrelationId, ExecutionFailedWithError, ExecutionRetriedTag, ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    when(7 <= cucumberVersion().major())
        .it('reports scenarios that have been retried and succeeded', () =>
            cucumber('features/retry.feature', 'retry.steps.ts', [ '--retry', '2' ])
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(0);

                    let currentSceneId: CorrelationId;

                    PickEvent.from(result.events)
                        .next(TestRunStarts, event => expect(event.timestamp).to.be.instanceof(Timestamp))

                        .next(SceneStarts, event => {
                            expect(event.details.name).to.equal(new Name('An eventually passing scenario'));
                            currentSceneId = event.sceneId;
                        })
                        .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                        .next(ActivityFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                        .next(SceneFinishes, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(RetryableSceneDetected, event => expect(event.sceneId).to.equal(currentSceneId))
                        .next(SceneTagged, event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                        .next(SceneFinished, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);
                        })

                        .next(SceneStarts, event => {
                            expect(event.details.name).to.equal(new Name('An eventually passing scenario'));
                            currentSceneId = event.sceneId;
                        })
                        .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                        .next(ActivityFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                        .next(SceneFinishes, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(RetryableSceneDetected, event => expect(event.sceneId).to.equal(currentSceneId))
                        .next(SceneTagged, event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                        .next(SceneTagged, event => expect(event.tag).to.equal(new ExecutionRetriedTag(1)))
                        .next(SceneFinished, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);
                        })

                        .next(SceneStarts, event => {
                            expect(event.details.name).to.equal(new Name('An eventually passing scenario'));
                            currentSceneId = event.sceneId;
                        })
                        .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                        .next(ActivityFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                        .next(SceneFinishes, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        // the scene is no longer retryable, so no RetryableSceneDetected
                        .next(SceneTagged, event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                        .next(SceneTagged, event => expect(event.tag).to.equal(new ExecutionRetriedTag(2)))
                        .next(SceneFinished, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.be.instanceOf(ExecutionSuccessful);
                        })

                        .next(TestRunFinishes, event => expect(event.timestamp).to.be.instanceof(Timestamp))
                        .next(TestRunFinished, event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    ;

                    const retryableSceneDetectedEvents = result.events.filter(event => event instanceof RetryableSceneDetected);

                    expect(retryableSceneDetectedEvents).to.have.lengthOf(2);
                }));

    when(7 <= cucumberVersion().major())
        .it('reports scenarios that have been retried and failed', () =>

            cucumber('features/retry.feature', 'retry.steps.ts', [ '--retry', '1' ])
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(1);

                    let currentSceneId: CorrelationId;

                    PickEvent.from(result.events)
                        .next(SceneStarts, event => {
                            expect(event.details.name).to.equal(new Name('An eventually passing scenario'));
                            currentSceneId = event.sceneId;
                        })
                        .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                        .next(ActivityFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                        .next(SceneFinishes, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(RetryableSceneDetected, event => expect(event.sceneId).to.equal(currentSceneId))
                        .next(SceneTagged, event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                        .next(SceneFinished, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);
                        })

                        .next(SceneStarts, event => {
                            expect(event.details.name).to.equal(new Name('An eventually passing scenario'));
                            currentSceneId = event.sceneId;
                        })
                        .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                        .next(ActivityFinished, event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                        .next(SceneFinishes, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })

                        // the scene is no longer retryable, so no RetryableSceneDetected
                        .next(SceneTagged, event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                        .next(SceneTagged, event => expect(event.tag).to.equal(new ExecutionRetriedTag(1)))
                        .next(SceneFinished, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);
                        })

                        .next(TestRunFinishes, event => expect(event).to.be.instanceOf(TestRunFinishes))
                        .next(TestRunFinished, event => expect(event).to.be.instanceOf(TestRunFinished))
                    ;

                    const retryableSceneDetectedEvents = result.events.filter(event => event instanceof RetryableSceneDetected);

                    expect(retryableSceneDetectedEvents).to.have.lengthOf(1);
                }));
});
