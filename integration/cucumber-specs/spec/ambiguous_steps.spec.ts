import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithError, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { cucumber, cucumberVersion } from '../src';

describe(`@serenity-js/cucumber with Cucumber ${ cucumberVersion() }`, function () {

    it('recognises scenarios with ambiguous steps', () =>
        cucumber('features/passing_scenario.feature', 'ambiguous.steps.ts')
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(res => {
                expect(res.exitCode).to.equal(1);

                PickEvent.from(res.events)
                    .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('A passing scenario')))
                    .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Cucumber')))
                    .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a passing scenario')))
                    .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                    .next(ActivityFinished, event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);

                        const err = (event.outcome as ExecutionFailedWithError).error;

                        const lines = err.message.split('\n');

                        expect(lines[0]).to.equal('Multiple step definitions match:');
                        expect(lines[1]).to.contain('/^.*step .* passes$/');
                        expect(lines[2]).to.contain('/^.*step .* passes$/');
                    })
                    .next(SceneFinishes, event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);

                        const err = (event.outcome as ExecutionFailedWithError).error;

                        expect(err.message).to.match(/^Multiple step definitions match/);
                    })
                    .next(SceneFinished, event => {
                        expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);

                        const err = (event.outcome as ExecutionFailedWithError).error;

                        expect(err.message).to.match(/^Multiple step definitions match/);
                    })
                ;
            })
    );
});
