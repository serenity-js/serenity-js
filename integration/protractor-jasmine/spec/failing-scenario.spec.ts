import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { AssertionError } from '@serenity-js/core';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithAssertionError, FeatureTag, Name, ProblemIndication } from '@serenity-js/core/lib/model';

import { protractor } from '../src/protractor';

describe('@serenity-js/jasmine', function () {

    this.timeout(30000);

    it('recognises a failing scenario', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/failing.spec.js',
        )
        .then(ifExitCodeIsOtherThan(1, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(1);

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails')))
                .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                .next(SceneFinished,       event => {
                    const outcome = event.outcome as ProblemIndication;
                    expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);

                    const error = outcome.error as AssertionError;

                    expect(error).to.be.instanceof(AssertionError);
                    expect(error.message).to.equal('Expected false to be true.');
                    expect(error.expected).to.equal(true);
                    expect(error.actual).to.equal(false);
                    expect(error.cause.message).to.equal(`Expected false to be true.`);
                })
            ;
        }));
});
