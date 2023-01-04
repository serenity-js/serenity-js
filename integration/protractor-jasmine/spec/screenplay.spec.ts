import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AsyncOperationAttempted, AsyncOperationCompleted, InteractionStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { CorrelationId, Description, ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { protractor } from '../src/protractor';

describe('@serenity-js/jasmine', function () {

    this.timeout(30000);

    it('correctly reports on Screenplay scenarios', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/screenplay.spec.js',
        )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                let currentSceneId: CorrelationId,
                    asyncDismissActorId: CorrelationId,
                    asyncHooksId: CorrelationId;

                PickEvent.from(result.events)
                    .next(SceneStarts,              event => {
                        expect(event.details.name).to.equal(new Name('A screenplay scenario passes'));
                        currentSceneId = event.sceneId;
                    })
                    .next(SceneTagged,              event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                    .next(TestRunnerDetected,       event => expect(event.name).to.equal(new Name('Jasmine')))
                    .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Jasmine disables synchronisation with Angular`)))
                    .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Jasmine navigates to 'chrome://version/'`)))
                    .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Jasmine navigates to 'chrome://accessibility/'`)))
                    .next(InteractionStarts,        event => expect(event.details.name).to.equal(new Name(`Jasmine navigates to 'chrome://chrome-urls/'`)))

                    .next(SceneFinishes,            event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                    })
                    .next(AsyncOperationAttempted,  event => {
                        expect(event.name).to.equal(new Name('ProtractorReporter'))
                        expect(event.description).to.equal(new Description('Invoking ProtractorRunner.afterEach...'))
                        asyncHooksId = event.correlationId;
                    })
                    .next(AsyncOperationCompleted,  event => expect(event.correlationId).to.equal(asyncHooksId))
                    .next(AsyncOperationAttempted,  event => {
                        expect(event.name).to.equal(new Name('Stage'))
                        expect(event.description).to.equal(new Description('Dismissing Jasmine...'))
                        asyncDismissActorId = event.correlationId;
                    })
                    .next(AsyncOperationCompleted,  event => expect(event.correlationId).to.equal(asyncDismissActorId))
                    .next(SceneFinished,            event => {
                        expect(event.sceneId).to.equal(currentSceneId);
                        expect(event.outcome).to.equal(new ExecutionSuccessful());
                    })
                ;
            }));
});
