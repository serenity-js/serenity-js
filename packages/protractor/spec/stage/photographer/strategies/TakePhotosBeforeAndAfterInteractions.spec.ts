import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { Duration } from '@serenity-js/core';
import { ArtifactGenerated } from '@serenity-js/core/lib/events';
import { Photo } from '@serenity-js/core/lib/model';
import { Stage } from '@serenity-js/core/lib/stage';

import { Photographer, TakePhotosBeforeAndAfterInteractions } from '../../../../src/stage';
import { create } from '../create';
import { Perform } from '../fixtures';

describe('Photographer', function() {

    this.timeout(5000);

    describe(`when instructed to take photos before and after all interactions`, () => {

        let photographer: Photographer,
            stage: Stage,
            recorder: EventRecorder;

        beforeEach(() => {
            const testSubject = create(Duration.ofSeconds(3));
            stage = testSubject.stage;
            recorder = testSubject.recorder;

            photographer = new Photographer(new TakePhotosBeforeAndAfterInteractions(), stage);
            stage.manager.register(photographer);
        });

        it(`takes a before and after photo when the interaction goes well`, () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatSucceeds(1),
            )).to.be.fulfilled.then(() => stage.manager.waitForNextCue().then(() => {

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`Before Betty succeeds (#1)`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    })
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`After Betty succeeds (#1)`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    });
            })));

        it(`takes a photo when a problem occurs`, () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatFailsWith(Error),
            )).to.be.rejected.then(() => stage.manager.waitForNextCue().then(() => {

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`Before Betty fails due to Error`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    })
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`After Betty fails due to Error`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    });
            })));

        it(`takes a photo before and after Interaction, even though nested tasks might all be marked as failing`, () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.taskWith(
                    Perform.taskWith(
                        Perform.interactionThatFailsWith(TypeError),
                    ),
                ),
            )).to.be.rejected.then(() => stage.manager.waitForNextCue().then(() => {

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`Before Betty fails due to TypeError`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    })
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`After Betty fails due to TypeError`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    });
            })));

        it(`takes two photos per interaction`, () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatSucceeds(1),
                Perform.interactionThatSucceeds(2),
            )).to.be.fulfilled.then(() => stage.manager.waitForNextCue().then(() => {

                PickEvent.from(recorder.events)
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`Before Betty succeeds (#1)`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    })
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`After Betty succeeds (#1)`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    })
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`Before Betty succeeds (#2)`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    })
                    .next(ArtifactGenerated, event => {
                        expect(event.name.value).to.equal(`After Betty succeeds (#2)`);
                        expect(event.artifact).to.be.instanceof(Photo);
                    });
            })));
    });
});
