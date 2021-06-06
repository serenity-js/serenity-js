import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithError, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { given } from 'mocha-testdata';

import { CucumberRunner, cucumberVersions } from '../../src';

describe('@serenity-js/cucumber', function () {

    this.timeout(5000);

    given([
        ...cucumberVersions(1, 2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/index.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('ambiguous')
            .toRun('features/passing_scenario.feature'),

        ...cucumberVersions(3, 4, 5, 6)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('ambiguous')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
            )
            .toRun('features/passing_scenario.feature'),
    ]).
    it('recognises scenarios with ambiguous steps', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(1, logOutput)).
        then(result => {
            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts, event => expect(event.details.name).to.equal(new Name('A passing scenario')))
                .next(TestRunnerDetected, event => expect(event.name).to.equal(new Name('Cucumber')))
                .next(SceneTagged, event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a passing scenario')))
                .next(ActivityStarts, event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                .next(ActivityFinished, event => {
                    expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError);

                    const error = (event.outcome as ExecutionFailedWithError).error;

                    const lines = error.message.split('\n');

                    expect(lines[0]).to.equal('Multiple step definitions match:');
                    expect(lines[1]).to.contain('/^.*step (?:.*) passes$/');
                    expect(lines[1]).to.contain('ambiguous.steps.js');
                    expect(lines[2]).to.contain('/^.*step (?:.*) passes$/');
                    expect(lines[2]).to.contain('ambiguous.steps.js');
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
