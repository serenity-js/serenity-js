import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityRelatedArtifactGenerated, SceneFinished, SceneStarts } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithAssertionError, ExecutionSuccessful, Name, Photo, ProblemIndication } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { playwrightTest } from '../src/playwright-test';

describe('@serenity-js/playwright-test', function () {

    describe('augments Playwright test reports with screenshots when scenario', () => {

        it(`fails, by default`, () => {
            return playwrightTest('--project=screenplay-photographer-default', 'screenplay/photographer-take-photos-of-failures.spec.ts')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(1);

                    PickEvent.from(result.events)
                        .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('A screenplay scenario includes a screenshot when an interaction fails, by default')))
                        .next(ActivityRelatedArtifactGenerated, event => {
                            expect(event.artifact).to.be.instanceOf(Photo);
                            expect(event.name.value).to.match(/Phoebe ensures that false does equal true/);
                        })
                        .next(SceneFinished, event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                        })
                    ;
                });
        });

        it(`triggers the configured strategy`, () =>
            playwrightTest('--project=screenplay-photographer-strategy', 'screenplay/photographer-take-photos-of-interactions.spec.ts')
                .then(ifExitCodeIsOtherThan(0, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(0);

                    PickEvent.from(result.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario can include screenshots when the strategy is triggered')))
                        .next(ActivityRelatedArtifactGenerated, event => {
                            expect(event.artifact).to.be.instanceOf(Photo);
                            expect(event.name.value).to.match(/Phoebe starts local server on a random port/);
                        })
                        .next(ActivityRelatedArtifactGenerated, event => {
                            expect(event.artifact).to.be.instanceOf(Photo);
                            expect(event.name.value).to.match(/Phoebe navigates to the URL of the local server/);
                        })
                        .next(ActivityRelatedArtifactGenerated, event => {
                            expect(event.artifact).to.be.instanceOf(Photo);
                            expect(event.name.value).to.match(/Phoebe stops the local server/);
                        })
                        .next(SceneFinished,       event => {
                            expect(event.outcome).to.be.instanceOf(ExecutionSuccessful);
                        })
                    ;
                }));
    });
});
