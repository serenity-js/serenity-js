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
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .toRun('features/failing_scenario.feature'),

        ...cucumberVersions(3, 4, 5, 6)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
            )
            .toRun('features/failing_scenario.feature'),
    ]).
    it('recognises a failing scenario', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(1, logOutput)).
        then(result => {
            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(TestRunStarts,       event => expect(event).to.be.instanceOf(TestRunStarts))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A failing scenario')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises a failing scenario')))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Given a step that fails with generic error')))
                .next(ActivityFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                .next(SceneFinishes,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                .next(TestRunFinishes,     event => expect(event).to.be.instanceOf(TestRunFinishes))
                .next(TestRunFinished,     event => expect(event).to.be.instanceOf(TestRunFinished))
            ;
        }));
});
