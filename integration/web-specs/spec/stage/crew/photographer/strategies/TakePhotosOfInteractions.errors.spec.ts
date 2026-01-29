import 'mocha';

import { EventRecorder, expect } from '@integration/testing-tools';
import { Cast, Duration } from '@serenity-js/core';
import {
    ActorEntersStage,
    InteractionFinished,
    InteractionStarts,
    SceneFinishes,
    SceneStarts
} from '@serenity-js/core/lib/events';
import { ExecutionSuccessful } from '@serenity-js/core/lib/model';
import { Stage } from '@serenity-js/core/lib/stage';
import { Photographer, TakePhotosOfInteractions } from '@serenity-js/web';

import { create } from '../create';
import { defaultCardScenario, Perform, sceneId } from '../fixtures';

describe('Photographer', () => {

    describe('when instructed to take a photo of all interactions', () => {

        let photographer: Photographer,
            stage: Stage,
            recorder: EventRecorder;

        beforeEach(() => {
            const cueTimeout = Duration.ofSeconds(10);
            const testSubject = create(cueTimeout, Cast.where(actor => actor));
            stage = testSubject.stage;
            recorder = testSubject.recorder;

            photographer = new Photographer(new TakePhotosOfInteractions(), stage);
            stage.assign(photographer);

            stage.announce(new SceneStarts(sceneId, defaultCardScenario))
        });

        afterEach(async () => {
            stage.announce(new SceneFinishes(sceneId, new ExecutionSuccessful()));
            await stage.waitForNextCue();
        });

        it(`does not attempt to take a photo if the actor in the spotlight can't BrowseTheWeb`, () =>
            expect(stage.theActorCalled(`Adam who can't browse the web`).attemptsTo(
                Perform.interactionThatSucceeds(1),
            )).to.be.fulfilled.then(() => stage.waitForNextCue().then(() => {

                expect(recorder.events.length).to.equal(4);
                expect(recorder.events[0]).to.be.instanceOf(SceneStarts);
                expect(recorder.events[1]).to.be.instanceOf(ActorEntersStage);
                expect(recorder.events[2]).to.be.instanceOf(InteractionStarts);
                expect(recorder.events[3]).to.be.instanceOf(InteractionFinished);

                // no artifacts generated for an actor with no ability to BrowseTheWeb
            })));
    });
});
