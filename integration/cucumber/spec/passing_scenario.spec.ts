import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import {
    ActivityFinished,
    ActivityStarts,
    SceneFinished,
    SceneStarts,
    SceneTagged,
    TestRunnerDetected,
} from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';

import 'mocha';
import { given } from 'mocha-testdata';
import { CucumberRunner, cucumberVersions } from '../src';

describe('@serenity-js/cucumber', function () {

    this.timeout(5000);

    given([
        ...cucumberVersions(1, 2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/index.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .toRun('features/passing_scenario.feature'),

        ...cucumberVersions(3, 4, 5, 6)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
            )
            .toRun('features/passing_scenario.feature'),
    ]).
    it('recognises a passing scenario', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            PickEvent.from(res.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A passing scenario')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a passing scenario')))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
            ;
        }));
});
