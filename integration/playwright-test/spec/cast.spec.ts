import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityRelatedArtifactGenerated, InteractionStarts, SceneFinished, SceneStarts, SceneTagged } from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    this.timeout(60 * 1000);

    describe('supports configuring casts of actors', () => {

        it('injects actors with default abilities', () =>
            playwrightTest(`--project=default`, 'screenplay/inspect-default-cast.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario receives an actor with default abilities')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test configuration')))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alice logs: 'GenericCast'`)))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alice logs: 'BrowseTheWebWithPlaywright'`)))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alice logs: 'TakeNotes'`)))
                        .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                    ;
                }));

        it('injects actors using a custom cast', () =>
            playwrightTest(`--project=screenplay-custom-cast`, 'screenplay/inspect-custom-cast.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {

                    expect(result.exitCode).to.equal(0);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario receives an actor from a custom cast')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Playwright Test configuration')))
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alice logs: a note of contextOptions`)))
                        .next(ActivityRelatedArtifactGenerated,   event => {
                            expect(event.artifact.map(value => JSON.parse(value.data))).to.deep.equal({
                                defaultNavigationTimeout: 30000,
                                defaultNavigationWaitUntil: 'networkidle'
                            });
                        })
                        .next(InteractionStarts,   event => expect(event.details.name).to.equal(new Name(`Alice logs: a note of options`)))
                        .next(ActivityRelatedArtifactGenerated,   event => {
                            expect(event.artifact.map(value => JSON.parse(value.data))).to.deep.equal({
                                apiUrl: 'https://api.example.org'
                            });
                        })
                        .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
                    ;
                }));
    });
});
