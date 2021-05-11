/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionSkipped, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', () => {

    describe('when working with Cucumber 7', () => {

        it(`recognises a scenario tagged as 'skipped'`, () =>
            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/common.steps.ts',
                '--require', './examples/step_definitions/skip_hook.ts',
                '--name', 'A scenario which tag marks it as skipped',
                './examples/features/skipped_scenario.feature',
            )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario which tag marks it as skipped')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises skipped scenarios')))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Before`)))
                    .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                    .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Given step number one that passes`)))
                    .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                    .next(SceneFinishes,       event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                    .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                ;
            }));
    });
});
