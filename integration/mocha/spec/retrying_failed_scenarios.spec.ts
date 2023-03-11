import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { RetryableSceneDetected, SceneFinished, SceneStarts, SceneTagged, TestRunFinished, TestRunFinishes, TestRunStarts } from '@serenity-js/core/lib/events';
import { ArbitraryTag, CorrelationId, ExecutionIgnored, ExecutionRetriedTag, ExecutionSuccessful, FeatureTag, Name, ProblemIndication } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { mocha } from '../src/mocha';

describe('@serenity-js/mocha', function () {

    this.timeout(30000);

    it('reports each retry of a retryable scenario', () =>
        mocha('examples/retries.spec.js', '--retries=2')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                let sceneId: CorrelationId;

                PickEvent.from(result.events)
                    .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))

                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('A scenario passes the third time'))
                        sceneId = event.sceneId;
                    })
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                    .next(RetryableSceneDetected, event => expect(event.sceneId).to.equal(sceneId))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneFinished,       event => {
                        const outcome: ProblemIndication = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionIgnored);
                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.equal('Something happened');
                    })
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('A scenario passes the third time'))
                        sceneId = event.sceneId;
                    })
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                    .next(RetryableSceneDetected, event => expect(event.sceneId).to.equal(sceneId))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ExecutionRetriedTag(1)))
                    .next(SceneFinished,       event => {
                        const outcome: ProblemIndication = event.outcome as ProblemIndication;
                        expect(outcome).to.be.instanceOf(ExecutionIgnored);
                        expect(outcome.error.name).to.equal('Error');
                        expect(outcome.error.message).to.equal('Something happened');
                    })
                    .next(SceneStarts,         event => {
                        expect(event.details.name).to.equal(new Name('A scenario passes the third time'))
                        sceneId = event.sceneId;
                    })
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha reporting')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ArbitraryTag('retried')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new ExecutionRetriedTag(2)))
                    .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))

                    .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                    .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;
            }));

    it(`doesn't announce retries if the scenario is not being retried`, () =>
        mocha('examples/passing.spec.js')
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                const sceneTaggedEvents = result.events.filter(e => e instanceof SceneTagged) as SceneTagged[];

                expect(sceneTaggedEvents).to.have.lengthOf(1);

                expect(sceneTaggedEvents[0].tag).to.equal(new FeatureTag('Mocha reporting'))
            }));
});
