import 'mocha';

import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { ActivityRelatedArtifactGenerated, ActivityStarts } from '@serenity-js/core/lib/events';
import { CorrelationId, Photo } from '@serenity-js/core/lib/model';
import { Stage } from '@serenity-js/core/lib/stage';

import { Photographer, TakePhotosOfFailures } from '../../../../../src';
import { create } from '../create';
import { Perform } from '../fixtures';

describe('Photographer', () => {

    describe('when instructed to take a photo of failed interactions,', () => {

        let photographer: Photographer,
            stage: Stage,
            recorder: EventRecorder;

        beforeEach(() => {
            const sut = create();
            stage = sut.stage;
            recorder = sut.recorder;

            photographer = new Photographer(new TakePhotosOfFailures(), stage);
            stage.assign(photographer);
        });

        it('does nothing if everything goes well', () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatSucceeds(),
            )).to.be.fulfilled.then(() => stage.waitForNextCue().then(() => {
                expect(recorder.events).to.have.lengthOf(2);    // Interaction starts and finishes
            })));

        it('takes a photo when a problem occurs', () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatFailsWith(Error),
            )).to.be.rejected.then(() => stage.waitForNextCue().then(() => {

                PickEvent.from(recorder.events)
                    .next(ActivityRelatedArtifactGenerated, event => {
                        expect(event.name.value).to.match(/Betty fails due to Error$/);
                        expect(event.artifact).to.be.instanceof(Photo);
                    });
            })));

        it(`correlates the photo with the activity it is concerning`, () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatFailsWith(Error),
            )).to.be.rejected.then(() => stage.waitForNextCue().then(() => {

                let activityId: CorrelationId;

                PickEvent.from(recorder.events)
                    .next(ActivityStarts, event => {
                        activityId = event.activityId;
                    })
                    .next(ActivityRelatedArtifactGenerated, event => {
                        expect(event.activityId).to.equal(activityId);
                    });
            })));

        it('takes only one picture, even though nested tasks might all be marked as failing', () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.taskWith(
                    Perform.taskWith(
                        Perform.interactionThatFailsWith(TypeError),
                    ),
                ),
            )).to.be.rejected.then(() => stage.waitForNextCue().then(() => {

                PickEvent.from(recorder.events)
                    .next(ActivityRelatedArtifactGenerated, event => {
                        expect(event.name.value).to.match(/Betty fails due to TypeError$/);
                        expect(event.artifact).to.be.instanceof(Photo);
                    });
            })));

        it(`includes the browser context in the name of the emitted artifact`, () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatFailsWith(Error),
            )).to.be.rejected.then(() => stage.waitForNextCue().
            then(() => {

                const capabilities = browser.capabilities;

                PickEvent.from(recorder.events)
                    .next(ActivityRelatedArtifactGenerated, event => {
                        expect(event.name.value).to.equal(
                            `${ capabilities.platformName }-${ capabilities.browserName }-${ capabilities.browserVersion }-Betty fails due to Error`,
                        );
                    });
            })));
    });
});
