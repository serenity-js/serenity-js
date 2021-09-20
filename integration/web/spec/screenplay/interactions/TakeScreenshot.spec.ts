import 'mocha';

import { EventRecorder, expect, PickEvent } from '@integration/testing-tools';
import { Clock, Serenity, serenity } from '@serenity-js/core';
import { ActivityRelatedArtifactGenerated } from '@serenity-js/core/lib/events';
import { Navigate, TakeScreenshot } from '@serenity-js/web';

/** @test {TakeScreenshot} */
describe('TakeScreenshot', () => {

    let recorder: EventRecorder;
    let localSerenity: Serenity;

    beforeEach(() => {
        const frozenClock = new Clock(() => new Date('1970-01-01'));
        const actors = (serenity as any).stage.cast
        localSerenity = new Serenity(frozenClock);
        recorder = new EventRecorder();

        localSerenity.configure({
            actors,
            crew: [ recorder ],
        });
    });

    /** @test {TakeScreenshot.of} */
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

    /** @test {TakeScreenshot.of} */
    /** @test {TakeScreenshot#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(TakeScreenshot.of('the page').toString()).to.equal(`#actor takes a screenshot of 'the page'`);
    });
});
