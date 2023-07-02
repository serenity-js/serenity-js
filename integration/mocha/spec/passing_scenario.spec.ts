import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunFinished, TestRunFinishes, TestRunnerDetected, TestRunStarts } from '@serenity-js/core/lib/events';
import { CorrelationId, ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { mocha } from '../src/mocha';

describe('@serenity-js/mocha', function () {

    this.timeout(30000);

    it('recognises a passing scenario', () => mocha('examples/passing.spec.js')
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(0);

            let currentSceneId: CorrelationId;

            PickEvent.from(result.events)
                .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(SceneStarts,         event => {
                    expect(event.details.name).to.equal(new Name('A scenario passes'));
                    currentSceneId = event.sceneId;
                })
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                .next(SceneFinishes,       event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                })
                .next(SceneFinished,       event => {
                    expect(event.sceneId).to.equal(currentSceneId);
                    expect(event.outcome).to.equal(new ExecutionSuccessful());
                })
                .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;
        }));
});
