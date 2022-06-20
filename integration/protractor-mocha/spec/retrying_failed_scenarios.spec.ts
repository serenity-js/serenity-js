import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithError, ExecutionIgnored, ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { protractor } from '../src/protractor';

describe('@serenity-js/mocha', function () {

    this.timeout(30000);

    it('recognises a retryable scenario, which eventually fails', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/retries_passing_the_third_time.spec.js',
            '--mochaOpts.retries=1',
        )
        .then(ifExitCodeIsOtherThan(1, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(1);   // Protractor will still report 3 failed attempts as a scenario failure

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario passes the third time')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionIgnored))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
            ;
        }));

    it('recognises a retryable scenario, which eventually passes', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/retries_passing_the_third_time.spec.js',
            '--mochaOpts.retries=2',
        )
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(result => {

            expect(result.exitCode).to.equal(0);   // Protractor will still report 3 failed attempts as a scenario failure

            PickEvent.from(result.events)
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario passes the third time')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionIgnored))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionIgnored))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        }));
});
