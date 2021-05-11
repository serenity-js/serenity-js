/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import {
    ActivityFinished,
    ActivityStarts,
    SceneFinished, SceneFinishes,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { ExecutionFailedWithError, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { cucumber7 } from './bin/cucumber-7';

describe('CucumberMessagesListener', () => {

    describe('when working with Cucumber 7', () => {

        it('recognises scenarios with ambiguous steps', () =>
            cucumber7(
                '--format', '../../../src',
                '--require', './examples/support/serenity.config.ts',
                '--require', './examples/step_definitions/ambiguous.steps.ts',
                './examples/features/passing_scenario.feature',
            )
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {
                expect(result.exitCode).to.equal(1);

                PickEvent.from(result.events)
                    .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('A passing scenario')))
                    .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('A passing feature')))
                    .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                    .next(ActivityFinished, event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);

                        const error = (event.outcome as ExecutionFailedWithError).error;

                        const lines = error.message.split('\n');

                        expect(lines[0]).to.equal('Multiple step definitions match:');
                        expect(lines[1]).to.contain('/^.*step .* passes$/');
                        expect(lines[1]).to.contain('ambiguous.steps.ts');
                        expect(lines[2]).to.contain('/^.*step .* passes$/');
                        expect(lines[2]).to.contain('ambiguous.steps.ts');
                    })
                    .next(SceneFinishes, event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);

                        const error = (event.outcome as ExecutionFailedWithError).error;

                        expect(error.message).to.match(/^Multiple step definitions match/);
                    })
                    .next(SceneFinished, event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);

                        const error = (event.outcome as ExecutionFailedWithError).error;

                        expect(error.message).to.match(/^Multiple step definitions match/);
                    })
                ;
            }));
    });
});
