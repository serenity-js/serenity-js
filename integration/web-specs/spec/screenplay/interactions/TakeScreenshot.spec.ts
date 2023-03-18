import 'mocha';

import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { Clock, Serenity, serenity } from '@serenity-js/core';
import { ActivityRelatedArtifactGenerated, SceneFinishes, SceneStarts } from '@serenity-js/core/lib/events';
import { Navigate, TakeScreenshot } from '@serenity-js/web';

import { defaultCardScenario, sceneId } from '../../stage/crew/photographer/fixtures';

describe('TakeScreenshot', () => {

    let recorder: EventRecorder;
    let localSerenity: Serenity;

    beforeEach(() => {
        const frozenClock = new Clock(() => new Date('1970-01-01'));
        const actors = (serenity as any).stage.cast;
        localSerenity = new Serenity(frozenClock);
        recorder = new EventRecorder();

        localSerenity.configure({
            actors,
            crew: [ recorder ],
        });
        localSerenity.announce(new SceneStarts(sceneId, defaultCardScenario))
    });

    afterEach(async () => {
        localSerenity.announce(new SceneFinishes(sceneId));
        await localSerenity.waitForNextCue();
    });

    it('allows the actor to take a screenshot with an arbitrary name', () =>
        localSerenity.theActorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/take-screenshot/example.html'),
            TakeScreenshot.of('the page'),
        ).
        then(() => {
            PickEvent.from(recorder.events)
                .next(ActivityRelatedArtifactGenerated, (e: ActivityRelatedArtifactGenerated) => {
                    expect(e.name.value).to.equal('the page');
                });
        }));

    it('provides a sensible description of the interaction being performed', () => {
        expect(TakeScreenshot.of('the page').toString()).to.equal(`#actor takes a screenshot of 'the page'`);
    });

    it('correctly detects its invocation location', () => {
        const activity = TakeScreenshot.of('the page');
        const location = activity.instantiationLocation();

        expect(location.path.basename()).to.equal('TakeScreenshot.spec.ts');
        expect(location.line).to.equal(50);
        expect(location.column).to.equal(41);
    });
});
