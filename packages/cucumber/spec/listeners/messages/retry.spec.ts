import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
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
import { ArbitraryTag, CorrelationId, ExecutionFailedWithError, ExecutionRetriedTag, ExecutionSuccessful, Name, Timestamp } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', function () {

    this.timeout(30000);

    describe('when working with Cucumber 7', () => {

        it('reports scenarios that have been retried and succeeded', () =>

            cucumber7(
                '--format', '../../../src',
                '--retry', '2',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/retry.steps.ts',
                './examples/features/retry.feature',
            )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                let sceneId: CorrelationId;

                PickEvent.from(result.events)
                    .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))

                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('An eventually passing scenario'))
                        sceneId = event.sceneId;
                    })
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    .next(SceneFinishes,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    .next(RetryableSceneDetected, event => expect(event.sceneId).to.equal(sceneId))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))

                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('An eventually passing scenario'))
                        sceneId = event.sceneId;
                    })
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    .next(SceneFinishes,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    .next(RetryableSceneDetected, event => expect(event.sceneId).to.equal(sceneId))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ExecutionRetriedTag(1)))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))

                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('An eventually passing scenario'))
                        sceneId = event.sceneId;
                    })
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                    .next(SceneFinishes,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                    // the scene is no longer retryable, so no RetryableSceneDetected
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ExecutionRetriedTag(2)))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))

                    .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;

                const retryableSceneDetectedEvents = result.events.filter(event => event instanceof RetryableSceneDetected)

                expect(retryableSceneDetectedEvents).to.have.lengthOf(2);
            }));

        it('reports scenarios that have been retried and failed', () =>

            cucumber7(
                '--format', '../../../src',
                '--retry', '1',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/retry.steps.ts',
                './examples/features/retry.feature',
            )
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                let sceneId: CorrelationId;

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('An eventually passing scenario'))
                        sceneId = event.sceneId;
                    })
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    .next(SceneFinishes,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    .next(RetryableSceneDetected, event => expect(event.sceneId).to.equal(sceneId))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))

                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('An eventually passing scenario'))
                        sceneId = event.sceneId;
                    })
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that eventually passes')))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                    .next(SceneFinishes,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))

                    // the scene is no longer retryable, so no RetryableSceneDetected
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ExecutionRetriedTag(1)))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))

                    .next(TestRunFinishes,     event => expect(event).to.be.instanceOf(TestRunFinishes))
                    .next(TestRunFinished,     event => expect(event).to.be.instanceOf(TestRunFinished))
                ;

                const retryableSceneDetectedEvents = result.events.filter(event => event instanceof RetryableSceneDetected)

                expect(retryableSceneDetectedEvents).to.have.lengthOf(1);
            }));
    });
});
