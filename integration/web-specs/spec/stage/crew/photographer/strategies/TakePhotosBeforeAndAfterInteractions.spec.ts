import 'mocha';

import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { Duration } from '@serenity-js/core';
import { ActivityFinished, ActivityRelatedArtifactGenerated, ActivityStarts, ArtifactGenerated, AsyncOperationAttempted, DomainEvent, SceneFinishes, SceneStarts } from '@serenity-js/core/lib/events';
import { CorrelationId, Photo } from '@serenity-js/core/lib/model';
import { Stage } from '@serenity-js/core/lib/stage';
import { BrowseTheWeb, Photographer, TakePhotosBeforeAndAfterInteractions } from '@serenity-js/web';

import { create } from '../create';
import { defaultCardScenario, Perform, sceneId } from '../fixtures';

describe('Photographer', function () {

    this.timeout(60 * 1000);

    describe('when instructed to take photos before and after all interactions', () => {

        let photographer: Photographer,
            stage: Stage,
            recorder: EventRecorder;

        beforeEach(() => {
            const testSubject = create(Duration.ofSeconds(10));
            stage = testSubject.stage;
            recorder = testSubject.recorder;

            photographer = new Photographer(new TakePhotosBeforeAndAfterInteractions(), stage);
            stage.assign(photographer);
            stage.announce(new SceneStarts(sceneId, defaultCardScenario))
        });

        afterEach(async () => {
            stage.announce(new SceneFinishes(sceneId));
            await stage.waitForNextCue();
        });

        it('takes a before and after photo when the interaction goes well', () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatSucceeds(1),
            )).to.be.fulfilled.then(() => stage.waitForNextCue().then(() => {

                const events = stringified(recorder.events);

                PickEvent.from(recorder.events)
                    .next(AsyncOperationAttempted, event => {
                        expect(event.description.value, events).to.match(/Taking screenshot of 'Before Betty succeeds \(#1\)'...$/);
                    })
                    .next(AsyncOperationAttempted, event => {
                        expect(event.description.value, events).to.match(/Taking screenshot of 'After Betty succeeds \(#1\)'...$/);
                    });
            })));

        it('takes a photo when a problem occurs', () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatFailsWith(Error),
            )).to.be.rejected.then(() => stage.waitForNextCue().then(() => {

                const events = stringified(recorder.events);

                PickEvent.from(recorder.events)
                    .next(AsyncOperationAttempted, event => {
                        expect(event.description.value, events).to.match(/Taking screenshot of 'Before Betty fails due to Error'...$/);
                    })
                    .next(AsyncOperationAttempted, event => {
                        expect(event.description.value, events).to.match(/Taking screenshot of 'After Betty fails due to Error'...$/);
                    });
            })));

        it('takes a photo before and after Interaction, even though nested tasks might all be marked as failing', () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.taskWith(
                    Perform.taskWith(
                        Perform.interactionThatFailsWith(TypeError),
                    ),
                ),
            )).to.be.rejected.then(() => stage.waitForNextCue().then(() => {

                const events = stringified(recorder.events);

                PickEvent.from(recorder.events)
                    .next(AsyncOperationAttempted, event => {
                        expect(event.description.value, events).to.match(/Taking screenshot of 'Before Betty fails due to TypeError'...$/);
                    })
                    .next(AsyncOperationAttempted, event => {
                        expect(event.description.value, events).to.match(/Taking screenshot of 'After Betty fails due to TypeError'...$/);
                    });
            })));

        it('takes two photos per interaction', () =>
            expect(stage.theActorCalled('Betty').attemptsTo(
                Perform.interactionThatSucceeds(1),
                Perform.interactionThatSucceeds(2),
            )).to.be.fulfilled.then(() => stage.waitForNextCue().then(() => {

                let cid1: CorrelationId,
                    cid2: CorrelationId;

                PickEvent.from(recorder.events)
                    .next(ActivityStarts, event => { cid1 = event.activityId; })
                    .next(ActivityStarts, event => { cid2 = event.activityId; });

                const
                    firstActivityEvents  = recorder.events.filter(withCorrelationIdOf(cid1)),
                    secondActivityEvents = recorder.events.filter(withCorrelationIdOf(cid2));

                expect(firstActivityEvents).to.have.lengthOf(4);
                expect(secondActivityEvents).to.have.lengthOf(4);

                const firstBefore   = firstActivityEvents.find(artifactGeneratedEventFor(/Before Betty succeeds \(#1\)$/));
                const firstAfter    = firstActivityEvents.find(artifactGeneratedEventFor(/After Betty succeeds \(#1\)$/));

                expect(firstBefore).is.not.undefined;
                expect(firstBefore.artifact).to.be.instanceof(Photo);
                expect(firstAfter).is.not.undefined;
                expect(firstAfter.artifact).to.be.instanceof(Photo);

                const secondBefore = secondActivityEvents.find(artifactGeneratedEventFor(/Before Betty succeeds \(#2\)$/))
                const secondAfter  = secondActivityEvents.find(artifactGeneratedEventFor(/After Betty succeeds \(#2\)$/));

                expect(secondBefore).is.not.undefined;
                expect(secondBefore.artifact).to.be.instanceof(Photo);
                expect(secondAfter).is.not.undefined;
                expect(secondAfter.artifact).to.be.instanceof(Photo);
            })));

        it('includes the browser context in the name of the emitted artifact', async () => {
            const Betty = stage.theActorCalled('Betty');

            await expect(Betty.attemptsTo(
                Perform.interactionThatSucceeds(1),
            )).to.be.fulfilled

            await stage.waitForNextCue();

            const capabilities  = await BrowseTheWeb.as(Betty).browserCapabilities();
            const events        = stringified(recorder.events);

            expect(capabilities.platformName).to.not.be.undefined;
            expect(capabilities.browserName).to.not.be.undefined;
            expect(capabilities.browserVersion).to.not.be.undefined;

            const before   = recorder.events.find(artifactGeneratedEventFor(/Before Betty succeeds \(#1\)$/));
            const after    = recorder.events.find(artifactGeneratedEventFor(/After Betty succeeds \(#1\)$/));

            expect(before.name.value, events).to.equal(
                `${ capabilities.platformName }-${ capabilities.browserName }-${ capabilities.browserVersion }-Before Betty succeeds (#1)`,
            );
            expect(before.artifact, events).to.be.instanceof(Photo);

            expect(after.name.value, events).to.equal(
                `${ capabilities.platformName }-${ capabilities.browserName }-${ capabilities.browserVersion }-After Betty succeeds (#1)`,
            );
            expect(after.artifact, events).to.be.instanceof(Photo);
        });
    });
});

function stringified(events: DomainEvent[]): string {
    return JSON.stringify(events.map(event => event.toJSON()), undefined, 4);
}

function withCorrelationIdOf(cid: CorrelationId) {
    return (event: DomainEvent) => {
        const activityId = (event as ActivityRelatedArtifactGenerated | ActivityStarts | ActivityFinished).activityId;

        return activityId && cid.equals(activityId);
    };
}

function artifactGeneratedEventFor(expectedName: RegExp) {
    return (event: DomainEvent): event is ArtifactGenerated => {
        return event instanceof ArtifactGenerated
            && expectedName.test(event.name.value);
    }
}
