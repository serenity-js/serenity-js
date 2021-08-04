import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, StdOutReporter } from '@integration/testing-tools';
import { AssertionError } from '@serenity-js/core';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { BrowserTag, ExecutionFailedWithAssertionError, FeatureTag, Name, PlatformTag, ProblemIndication } from '@serenity-js/core/lib/model';
import { wdio } from '../src';

describe('@serenity-js/webdriverio with @serenity-js/jasmine', function () {

    this.timeout(30000);

    it('recognises a failing scenario', () =>
        wdio(
            './examples/wdio.conf.ts',
            '--spec=examples/failing.spec.js',
        )
        .then(ifExitCodeIsOtherThan(1, logOutput))
        .then(res => {

            expect(res.exitCode).to.equal(1);

            PickEvent.from(StdOutReporter.parse(res.stdout))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails')))
                .next(SceneTagged,         event => expect(event.tag).to.be.instanceOf(BrowserTag))
                .next(SceneTagged,         event => expect(event.tag).to.be.instanceOf(PlatformTag))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                .next(SceneFinished,       event => {
                    const outcome = event.outcome as ProblemIndication;

                    expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                    const error = outcome.error as AssertionError;

                    expect(error.message).to.equal('Expected false to be true.');
                    expect(error.expected).to.equal(true);
                    expect(error.actual).to.equal(false);
                })
            ;
        }));
});
