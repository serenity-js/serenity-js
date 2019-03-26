import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { ActivityRelatedArtifactGenerated, ActivityStarts, ArtifactGenerated } from '@serenity-js/core/lib/events';
import { CorrelationId, Photo } from '@serenity-js/core/lib/model';
import { Stage } from '@serenity-js/core/lib/stage';

import { Photographer, TakePhotosOfFailures } from '../../../../src/stage/photographer';
import { create } from '../create';
import { Perform } from '../fixtures';

describe('Photographer', () => {

    describe(`when instructed to take a photo of failed interactions,`, () => {

        let photographer: Photographer,
            stage: Stage,
            recorder: EventRecorder;

        beforeEach(() => {
            const sut = create();
            stage = sut.stage;
            recorder = sut.recorder;

            photographer = new Photographer(new TakePhotosOfFailures(), stage);
            stage.manager.register(photographer);
        });

        it(`does nothing if everything goes well`, () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatSucceeds(),
            )).to.be.fulfilled.then(() => stage.manager.waitForNextCue().then(() => {
                expect(recorder.events).to.have.lengthOf(2);    // Interaction starts and finishes
            })));

        it(`takes a photo when a problem occurs`, () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatFailsWith(Error),
            )).to.be.rejected.then(() => stage.manager.waitForNextCue().then(() => {

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`Betty fails due to Error`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    });
            })));

        it(`correlates the photo with the activity it's concerning`, () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatFailsWith(Error),
            )).to.be.rejected.then(() => stage.manager.waitForNextCue().then(() => {

                let correlationId: CorrelationId;

                PickEvent.from(recorder.events)
                    .next(ActivityStarts, event => {
                        correlationId = event.value.correlationId;
                    })
                    .next(ActivityRelatedArtifactGenerated, event => {
                        expect(event.details.correlationId).to.equal(correlationId);
                    });
            })));

        it(`takes only one picture, even though nested tasks might all be marked as failing`, () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.taskWith(
                    Perform.taskWith(
                        Perform.interactionThatFailsWith(TypeError),
                    ),
                ),
            )).to.be.rejected.then(() => stage.manager.waitForNextCue().then(() => {

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`Betty fails due to TypeError`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    });
            })));
    });
});
