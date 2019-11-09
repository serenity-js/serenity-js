import { EventRecorder, expect, PickEvent, stage } from '@integration/testing-tools';
import { Actor, Stage } from '@serenity-js/core';
import { ActivityRelatedArtifactGenerated } from '@serenity-js/core/lib/events';

import { Navigate, TakeScreenshot } from '../../../src';
import { pageFromTemplate } from '../../fixtures';
import { UIActors } from '../../UIActors';

describe('TakeScreenshot', () => {

    let theStage: Stage,
        Bernie: Actor,
        recorder: EventRecorder;

    beforeEach(() => {
        recorder = new EventRecorder();

        theStage = stage(new UIActors());
        theStage.assign(recorder);

        Bernie = theStage.actor('Bernie');
    });

    const page = pageFromTemplate(`
            <html>
                <body>
                    <form>
                        <input type="text" name="text" />
                    </form>
                </body>
            </html>
        `);

    /** @test {TakeScreenshot} */
    /** @test {TakeScreenshot.of} */
    it('allows the actor to take a screenshot with an arbitrary name', () => Bernie.attemptsTo(
        Navigate.to(page),
        TakeScreenshot.of('the page'),
    ).then(() => {
        PickEvent.from(recorder.events)
            .next(ActivityRelatedArtifactGenerated, (e: ActivityRelatedArtifactGenerated) => {
                expect(e.name.value).to.equal('the page');
            });
    }));

    /** @test {TakeScreenshot#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(TakeScreenshot.of('the page').toString()).to.equal(`#actor takes a screenshot of 'the page'`);
    });
});
