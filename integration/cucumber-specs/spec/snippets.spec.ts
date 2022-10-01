import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, when } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { trimmed } from '@serenity-js/core/lib/io';
import { CorrelationId, FeatureTag, ImplementationPending, Name } from '@serenity-js/core/lib/model';

import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, () => {

    when(7 <= cucumberVersion().major())
        .it(`suggests implementation of Cucumber steps that haven't been implemented yet`, () =>
            cucumber('features/snippets.feature', 'common.steps.ts', [
                '--name', 'A scenario with steps that have not been implemented yet',
                '--no-strict',  // --no-strict won't affect the outcome in this case
            ])
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(result => {
                    expect(result.exitCode).to.equal(1);

                    let currentSceneId: CorrelationId;

                    PickEvent.from(result.events)
                        .next(SceneStarts, event => {
                            expect(event.details.name).to.equal(new Name('A scenario with steps that have not been implemented yet'));
                            currentSceneId = event.sceneId;
                        })
                        .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Cucumber')))
                        .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS suggest implementation snippets')))
                        .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name(`Given a step that hasn't been implemented yet`)))
                        .next(ActivityFinished, event => {
                            expect(event.outcome).to.be.instanceOf(ImplementationPending);
                            const error = (event.outcome as ImplementationPending).error;

                            expect(error.message).to.equal(trimmed`
                            | Step implementation missing:
                            |
                            | Given('a step that hasn\\'t been implemented yet', function () {
                            |   // Write code here that turns the phrase above into concrete actions
                            |   return 'pending';
                            | });
                        `.trim());
                        })
                        .next(SceneFinishes, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                        })
                        .next(SceneFinished, event => {
                            expect(event.sceneId).to.equal(currentSceneId);
                            expect(event.outcome).to.be.instanceOf(ImplementationPending);

                            const error = (event.outcome as ImplementationPending).error;

                            expect(error.message).to.equal(trimmed`
                            | Step implementation missing:
                            |
                            | Given('a step that hasn\\'t been implemented yet', function () {
                            |   // Write code here that turns the phrase above into concrete actions
                            |   return 'pending';
                            | });
                            |
                            | Given('another one', function () {
                            |   // Write code here that turns the phrase above into concrete actions
                            |   return 'pending';
                            | });
                        `.trim());
                        })
                    ;
                }));
});
