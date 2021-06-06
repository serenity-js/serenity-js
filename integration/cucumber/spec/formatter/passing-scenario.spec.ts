import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import {
    ActivityFinished,
    ActivityStarts,
    SceneFinished,
    SceneFinishes,
    SceneStarts,
    SceneTagged,
    TestRunFinished,
    TestRunFinishes,
    TestRunnerDetected,
    TestRunStarts,
} from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, FeatureTag, Name, Timestamp } from '@serenity-js/core/lib/model';
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
        then(result => {
            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A passing scenario')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a passing scenario')))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that passes')))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                .next(SceneFinishes,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;
        }));
});
