import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, StdOutReporter } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import {
    BrowserTag,
    CapabilityTag,
    ExecutionFailedWithAssertionError,
    FeatureTag,
    Name,
    PlatformTag,
    ProblemIndication
} from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { wdio } from '../src';

describe('@serenity-js/webdriverio-8 with @serenity-js/jasmine', function () {

    this.timeout(60_000);

    it('recognises a failing scenario', () =>
        wdio(
            './examples/wdio.conf.ts',
            '--spec=examples/failing.spec.js',
        )
        .then(ifExitCodeIsOtherThan(1, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(1);

            PickEvent.from(StdOutReporter.parse(result.stdout))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails')))
                .next(SceneTagged,         event => expect(event.tag).to.be.instanceOf(BrowserTag))
                .next(SceneTagged,         event => expect(event.tag).to.be.instanceOf(PlatformTag))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new CapabilityTag('Examples')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                .next(SceneFinished,       event => {
                    const outcome = event.outcome as ProblemIndication;

                    expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                })
            ;
        }));
});
