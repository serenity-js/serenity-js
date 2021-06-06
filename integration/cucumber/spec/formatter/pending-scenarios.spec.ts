import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { ActivityFinished, ActivityStarts, SceneFinished, SceneFinishes, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionSkipped, FeatureTag, ImplementationPending, Name } from '@serenity-js/core/lib/model';
import { given } from 'mocha-testdata';

import { CucumberRunner, cucumberVersions } from '../../src';

describe('@serenity-js/cucumber', function () {

    this.timeout(5000);

    given([
        ...cucumberVersions(1)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/index.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario with steps marked as pending')
            .toRun('features/pending_scenarios.feature'),

        ...cucumberVersions(2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/index.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario with steps marked as pending', '--no-strict')
            .toRun('features/pending_scenarios.feature'),

        ...cucumberVersions(3, 4, 5, 6)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
                '--name', 'A scenario with steps marked as pending',
                '--no-strict',
            )
            .toRun('features/pending_scenarios.feature'),
    ]).
    it(`recognises a pending scenario where some steps are marked as 'pending'`, (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(result => {
            // expect(res.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario with steps marked as pending')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Given a step that's marked as pending`)))
                .next(ActivityFinished,    event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                .next(SceneFinishes,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                .next(SceneFinished,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
            ;
        }));

    given([
        ...cucumberVersions(1)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/index.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario with steps that have not been implemented yet')
            .toRun('features/pending_scenarios.feature'),

        ...cucumberVersions(2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/index.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario with steps that have not been implemented yet', '--no-strict')
            .toRun('features/pending_scenarios.feature'),

        ...cucumberVersions(3, 4, 5, 6)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
                // '--no-strict',                       // cucumber 3 ignores the --no-strict mode
                '--name', 'A scenario with steps that have not been implemented yet',
            )
            .toRun('features/pending_scenarios.feature'),
    ]).
    it(`recognises a pending scenario where some steps have not been implemented yet`, (runner: CucumberRunner) => runner.run().
        // then(ifExitCodeIsOtherThan(0, logOutput)).   // cucumber 3 ignores the --no-strict mode
        then(result => {
            // expect(res.exitCode).to.equal(0);        // cucumber 3 ignores the --no-strict mode

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario with steps that have not been implemented yet')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Given a step that hasn't been implemented yet`)))
                .next(ActivityFinished,    event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                .next(SceneFinishes,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
                .next(SceneFinished,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
            ;
        }));

    given([
        ...cucumberVersions(1)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/index.js',
                'lib/support/configure_serenity.js',
                'lib/support/wip_hook.js',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario which tag marks it as pending')
            .toRun('features/pending_scenarios.feature'),

        ...cucumberVersions(2)
            .thatRequires(
                'node_modules/@serenity-js/cucumber/lib/index.js',
                'lib/support/configure_serenity.js',
                'lib/support/wip_hook.js',
            )
            .withStepDefsIn('promise', 'callback', 'synchronous')
            .withArgs('--name', 'A scenario which tag marks it as pending', '--no-strict')
            .toRun('features/pending_scenarios.feature'),
    ]).
    it(`recognises a scenario tagged as 'pending'`, (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(result => {
            // expect(res.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario which tag marks it as pending')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Given step number one that passes`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`And step number two that is marked as pending`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`And step number three that fails with generic error`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(SceneFinished,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
            ;
        }));

    given([
        ...cucumberVersions(3, 4, 5, 6)
            .thatRequires(
                'lib/support/configure_serenity.js',
                'lib/support/wip_hook.js',
            )
            .withStepDefsIn('synchronous', 'promise', 'callback')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
                '--name', 'A scenario which tag marks it as pending',
                // '--no-strict',
            )
            .toRun('features/pending_scenarios.feature'),
    ]).
    it(`recognises a scenario tagged as 'pending'`, (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(1, logOutput)).
        then(result => {
            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario which tag marks it as pending')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises pending scenarios')))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`Given step number one that passes`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`And step number two that is marked as pending`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name(`And step number three that fails with generic error`)))
                .next(ActivityFinished,    event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                .next(SceneFinished,       event => expect(event.outcome.constructor).to.equal(ImplementationPending))
            ;
        }));
});
