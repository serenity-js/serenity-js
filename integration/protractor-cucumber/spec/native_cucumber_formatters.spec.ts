import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { SceneFinished, SceneStarts, SceneTagged, TestRunFinished, TestRunFinishes, TestRunnerDetected, TestRunStarts } from '@serenity-js/core/lib/events';
import { ExecutionSuccessful, FeatureTag, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { protractor } from '../src/protractor';

describe('@serenity-js/protractor with @serenity-js/cucumber', function () {

    this.timeout(30000);

    it('supports native Cucumber formatters', () =>
        protractor(
            './examples/protractor.conf.js',
            '--cucumberOpts.format=usage',
            '--specs=examples/features/passing.feature',
        )
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(0);

            PickEvent.from(result.events)
                .next(TestRunStarts,       event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A passing scenario')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Cucumber')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('A passing feature')))
                .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                .next(TestRunFinishes,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
                .next(TestRunFinished,     event => expect(event.timestamp).to.be.instanceof(Timestamp))
            ;

            // "usage" formatter output:
            // ┌──────────────────┬──────────┬──────────────────────────────────────┐
            // │ Pattern / Text   │ Duration │ Location                             │
            // ├──────────────────┼──────────┼──────────────────────────────────────┤
            // │ a passing step   │ 2.00ms   │ features/step_definitions/steps.js:3 │
            // │   a passing step │ 2ms      │ features/passing.feature:5           │
            // └──────────────────┴──────────┴──────────────────────────────────────┘

            expect(result.stdout).to.match(/Pattern \/ Text.*?Duration.*?Location/);
        }));
});
