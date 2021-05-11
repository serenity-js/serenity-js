import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { trimmed } from '@serenity-js/core/lib/io';
import { FeatureTag, ImplementationPending, Name } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', () => {

    describe('when working with Cucumber 7', () => {

        it(`suggests implementation of Cucumber steps that haven't been implemented yet`, () =>
            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/common.steps.ts',
                '--name', 'A scenario with steps that have not been implemented yet',
                '--no-strict',  // --no-strict won't affect the outcome in this case
                './examples/features/snippets.feature',
            )
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario with steps that have not been implemented yet')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS suggest implementation snippets')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Given a step that hasn't been implemented yet`)))
                    .next(ActivityFinished,    event => {
                        expect(event.outcome).to.be.instanceOf(ImplementationPending);
                        const error = (event.outcome as ImplementationPending).error;

                        expect(error.message).to.equal(trimmed `
                            | Step implementation missing:
                            |
                            | Given('a step that hasn\\'t been implemented yet', function () {
                            |   // Write code here that turns the phrase above into concrete actions
                            |   return 'pending';
                            | });
                        `.trim());
                    })
                    .next(SceneFinishes,       event => {
                        expect(event.outcome).to.be.instanceOf(ImplementationPending);

                        const error = (event.outcome as ImplementationPending).error;

                        // SceneFinishes is triggered by an AfterHook, which doesn't have access to code snippets
                        expect(error.message).to.equal('Step implementation missing');
                    })
                    .next(SceneFinished,       event => {
                        expect(event.outcome).to.be.instanceOf(ImplementationPending);

                        const error = (event.outcome as ImplementationPending).error;

                        expect(error.message).to.equal(trimmed `
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
});
