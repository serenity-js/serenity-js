import 'mocha';

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
            .withStepDefsIn('screenplay')
            .toRun('features/screenplay_scenario.feature'),

        ...cucumberVersions(3, 4, 5, 6)
            .thatRequires('lib/support/configure_serenity.js')
            .withStepDefsIn('screenplay')
            .withArgs(
                '--format', 'node_modules/@serenity-js/cucumber',
            )
            .toRun('features/screenplay_scenario.feature'),
    ]).
    it('recognises Screenplay activities in any part of the Cucumber scenario', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(result => {
            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises Screenplay activities')))
                // before step
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara makes an arrow')))
                .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara makes an arrow')))
                // when step
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('When Lara shoots an arrow')))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara fits an arrow to the bowstring')))
                .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara fits an arrow to the bowstring')))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara draws the bow')))
                .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara draws the bow')))
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara releases the bowstring')))
                .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara releases the bowstring')))
                .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('When Lara shoots an arrow')))
                // then step
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Then she should hit a target')))
                .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Then she should hit a target')))
                // after
                .next(ActivityStarts,      event => expect(event.details.name).to.equal(new Name('Lara retrieves the arrow from the target')))
                .next(ActivityFinished,    event => expect(event.details.name).to.equal(new Name('Lara retrieves the arrow from the target')))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
            ;
        }));
});
