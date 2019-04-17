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
                'node_modules/@serenity-js/cucumber/register.js',
                'lib/support/configure_serenity.js',
            )
            .withStepDefsIn('screenplay')
            .toRun('features/screenplay_scenario.feature'),

        // fixme: a bug in Event Protocol causes Cucumber 3-5 to incorrectly report test-step-start and test-step-finished events
        // fixme: see https://github.com/cucumber/cucumber-js/issues/1195
        // ...cucumberVersions(3, 4, 5)
        //     .thatRequires('lib/support/configure_serenity.js')
        //     .withStepDefsIn('tasty-cucumber')
        //     .withArgs(
        //         // '--format', 'node_modules/@serenity-js/cucumber/register.js',
        //         '--format', 'event-protocol',
        //     )
        //     // .toRun('features/screenplay_scenario.feature'),
        //     .toRun('features/tasty-cucumber.feature'),
    ]).
    it('recognises Screenplay activities in any part of the Cucumber scenario', (runner: CucumberRunner) => runner.run().
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(res => {
            expect(res.exitCode).to.equal(0);

            PickEvent.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A screenplay scenario')))
                .next(TestRunnerDetected,  event => expect(event.value).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Serenity/JS recognises Screenplay activities')))
                // before step
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name('Lara makes an arrow')))
                .next(ActivityFinished,    event => expect(event.value.name).to.equal(new Name('Lara makes an arrow')))
                // when step
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name('When Lara shoots an arrow')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name('Lara fits an arrow to the bowstring')))
                .next(ActivityFinished,    event => expect(event.value.name).to.equal(new Name('Lara fits an arrow to the bowstring')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name('Lara draws the bow')))
                .next(ActivityFinished,    event => expect(event.value.name).to.equal(new Name('Lara draws the bow')))
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name('Lara releases the bowstring')))
                .next(ActivityFinished,    event => expect(event.value.name).to.equal(new Name('Lara releases the bowstring')))
                .next(ActivityFinished,    event => expect(event.value.name).to.equal(new Name('When Lara shoots an arrow')))
                // then step
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name('Then she should hit a target')))
                .next(ActivityFinished,    event => expect(event.value.name).to.equal(new Name('Then she should hit a target')))
                // after
                .next(ActivityStarts,      event => expect(event.value.name).to.equal(new Name('Lara retrieves the arrow from the target')))
                .next(ActivityFinished,    event => expect(event.value.name).to.equal(new Name('Lara retrieves the arrow from the target')))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
            ;
        }));

    // todo: I added a skipped test so that I remember to add the tests above back in when the Cucumber bug is fixed
    it('recognises Screenplay activities in any part of the Cucumber scenario when the Event Protocol is being used');
});
