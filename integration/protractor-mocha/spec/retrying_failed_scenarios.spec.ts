import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AssertionError } from '@serenity-js/core';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithAssertionError, ExecutionFailedWithError, ExecutionSuccessful, FeatureTag, Name, ProblemIndication } from '@serenity-js/core/lib/model';
import { protractor } from '../src/protractor';

describe('@serenity-js/mocha', function () {

    this.timeout(30000);

    it('recognises a retryable scenario', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/retries_passing_the_third_time.spec.js',
            '--mochaOpts.retries=3',
        )
        .then(ifExitCodeIsOtherThan(1, logOutput))
        .then(res => {

            expect(res.exitCode).to.equal(1);   // Protractor will still report 3 failed attempts as a scenario failure

            PickEvent.from(res.events)
                .next(SceneStarts,         event => expect(event.value.name).to.equal(new Name('A scenario passes the third time')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        }));
});
