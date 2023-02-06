import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, StdOutReporter } from '@integration/testing-tools';
import { AssertionError } from '@serenity-js/core';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { BrowserTag, ExecutionFailedWithAssertionError, FeatureTag, Name, PlatformTag, ProblemIndication } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { wdio } from '../src';

describe('@serenity-js/mocha', function () {

    this.timeout(60_000);

    it('recognises a failing scenario', () =>
        wdio(
            './examples/wdio.conf.ts',
            '--spec=examples/failing_scenario.spec.ts',
        )
        .then(ifExitCodeIsOtherThan(1, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(1);

            PickEvent.from(StdOutReporter.parse(result.stdout))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails')))
                .next(SceneTagged,         event => expect(event.tag).to.be.instanceOf(BrowserTag))
                .next(SceneTagged,         event => expect(event.tag).to.be.instanceOf(PlatformTag))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Mocha')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Mocha')))
                .next(SceneFinished,       event => {
                    const outcome = event.outcome as ProblemIndication;

                    expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                    const error = outcome.error as AssertionError;

                    expect(error.message).to.equal(`Expected false to be true.`);
                })
            ;
        }));
});
