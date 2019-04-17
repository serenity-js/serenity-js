import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AssertionError } from '@serenity-js/core';
import {
    ActivityFinished,
    ActivityStarts,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { ExecutionFailedWithAssertionError, FeatureTag, Name } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';
import { CucumberRunner, cucumberVersions } from '../src';

describe('@serenity-js/cucumber', function () {

    this.timeout(5000);

    given([
        ...cucumberVersions(1, 2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/register.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .toRun('features/assertion_failure_scenario.feature'),

        ...cucumberVersions(3, 4, 5)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber/register.js',
            )
            .toRun('features/assertion_failure_scenario.feature'),
    ]).
    it('recognises a scenario failing due to an assertion failure', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(1, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(1);

            PickEvent.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('An assertion failure scenario')))
                .next(TestRunnerDetected,  event => expect(event.value).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a scenario failing due to an assertion error')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name('Given a step that fails with assertion error')))
                .next(ActivityFinished,    event => {
                    expect(event.outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                    expect((event.outcome as ExecutionFailedWithAssertionError).error).to.be.instanceOf(AssertionError);
                })
                .next(SceneFinished,       event => {
                    expect(event.outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                    expect((event.outcome as ExecutionFailedWithAssertionError).error).to.be.instanceOf(AssertionError);
                })
            ;
        }));
});
