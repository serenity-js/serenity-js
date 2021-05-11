/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { FeatureTag, ImplementationPending, Name } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', () => {

    describe('when working with Cucumber 7', () => {

        it(`recognises a pending scenario where some steps are marked as 'pending'`, () =>

            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/common.steps.ts',
                '--name', 'A scenario with steps marked as pending',
                '--no-strict',  // considered only when steps are explicitly marked as 'pending'
                './examples/features/pending_scenarios.feature',
            )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario with steps marked as pending')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Given a step that's marked as pending`)))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ImplementationPending))
                    .next(SceneFinishes,       event => expect(event.outcome).to.be.instanceOf(ImplementationPending))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ImplementationPending))
                ;
            }));

        it(`recognises a scenario tagged as 'pending'`, () =>
            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/common.steps.ts',
                '--require', './examples/step_definitions/wip_hook.ts',
                '--name', 'A scenario which tag marks it as pending',
                '--no-strict',  // considered only when steps are explicitly marked as 'pending'
                './examples/features/pending_scenarios.feature',
            )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario which tag marks it as pending')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Before`)))
                    .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ImplementationPending))
                    .next(SceneFinishes,       event => expect(event.outcome).to.be.instanceOf(ImplementationPending))
                    .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ImplementationPending))
                ;
            }));
    });
});
