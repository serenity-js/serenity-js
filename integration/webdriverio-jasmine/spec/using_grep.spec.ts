import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, StdOutReporter } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { BrowserTag, ExecutionSkipped, ExecutionSuccessful, FeatureTag, Name, PlatformTag } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { wdio } from '../src';

describe('@serenity-js/webdriverio with @serenity-js/jasmine', function () {

    this.timeout(60_000);

    it('allows for selective execution of scenarios via grep', () =>
        wdio(
            './examples/wdio.conf.ts',
            '--spec=examples/passing_and_failing.spec.js',
            '--jasmineOpts.grep=".*passes.*"',
        )
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(0);

            PickEvent.from(StdOutReporter.parse(result.stdout))
                .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name('A scenario passes')))
                .next(SceneTagged,          event => expect(event.tag).to.be.instanceOf(BrowserTag))
                .next(SceneTagged,          event => expect(event.tag).to.be.instanceOf(PlatformTag))
                .next(SceneTagged,          event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                .next(TestRunnerDetected,   event => expect(event.name).to.equal(new Name('Jasmine')))
                .next(SceneFinished,        event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name('A scenario fails')))
                .next(SceneTagged,          event => expect(event.tag).to.be.instanceOf(BrowserTag))
                .next(SceneTagged,          event => expect(event.tag).to.be.instanceOf(PlatformTag))
                .next(SceneTagged,          event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                .next(TestRunnerDetected,   event => expect(event.name).to.equal(new Name('Jasmine')))
                .next(SceneFinished,        event => expect(event.outcome).to.equal(new ExecutionSkipped()))
            ;
        }));

    it('allows for pattern to be inverted via invertGrep', () =>
        wdio(
            './examples/wdio.conf.ts',
            '--spec=examples/passing_and_failing.spec.js',
            '--jasmineOpts.grep=".*fails.*"',
            '--jasmineOpts.invertGrep=true',
        ).
        then(ifExitCodeIsOtherThan(0, logOutput)).
        then(result => {

            expect(result.exitCode).to.equal(0);

            PickEvent.from(StdOutReporter.parse(result.stdout))
                .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name('A scenario passes')))
                .next(SceneTagged,          event => expect(event.tag).to.be.instanceOf(BrowserTag))
                .next(SceneTagged,          event => expect(event.tag).to.be.instanceOf(PlatformTag))
                .next(SceneTagged,          event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                .next(TestRunnerDetected,   event => expect(event.name).to.equal(new Name('Jasmine')))
                .next(SceneFinished,        event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                .next(SceneStarts,          event => expect(event.details.name).to.equal(new Name('A scenario fails')))
                .next(SceneTagged,          event => expect(event.tag).to.be.instanceOf(BrowserTag))
                .next(SceneTagged,          event => expect(event.tag).to.be.instanceOf(PlatformTag))
                .next(SceneTagged,          event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                .next(TestRunnerDetected,   event => expect(event.name).to.equal(new Name('Jasmine')))
                .next(SceneFinished,        event => expect(event.outcome).to.equal(new ExecutionSkipped()))
            ;
        }));
});
