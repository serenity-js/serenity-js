import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import {
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
} from '@serenity-js/core/lib/events';
import { CorrelationId, Description, ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { protractor } from '../src/protractor';

describe('@serenity-js/mocha', function () {

    this.timeout(30000);

    it('recognises a passing scenario', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/passing.spec.js',
        )
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(0);

            let currentSceneId: CorrelationId,
                asyncBrowserDetectionId: CorrelationId,
                asyncHooksId: CorrelationId;

            PickEvent.from(result.events)
                .next(TestRunStarts,            event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(AsyncOperationAttempted,  event => {
                    expect(event.name).to.equal(new Name('BrowserDetector'))
                    expect(event.description).to.equal(new Description('Detecting web browser details...'))
                    asyncBrowserDetectionId = event.correlationId;
                })
                .next(SceneStarts,              event => {
                    expect(event.details.name).to.equal(new Name('A scenario passes'));
                    currentSceneId = event.sceneId;
                })
                .next(SceneTagged,              event => expect(event.tag).to.equal(new FeatureTag('Mocha')))
                .next(TestRunnerDetected,       event => expect(event.name).to.equal(new Name('Mocha')))

                .next(AsyncOperationCompleted,  event => expect(event.correlationId).to.equal(asyncBrowserDetectionId))
                .next(SceneFinishes,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(AsyncOperationAttempted,  event => {
                    expect(event.name).to.equal(new Name('ProtractorReporter'))
                    expect(event.description).to.equal(new Description('Invoking ProtractorRunner.afterEach...'))
                    asyncHooksId = event.correlationId;
                })
                .next(AsyncOperationCompleted,  event => expect(event.correlationId).to.equal(asyncHooksId))
                .next(SceneFinished,            event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })
                .next(TestRunFinishes,          event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,          event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;
        }));
});
