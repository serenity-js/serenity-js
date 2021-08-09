import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent, StdOutReporter } from '@integration/testing-tools';
import { SceneFinished, SceneStarts } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithError, ExecutionIgnored, ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';
import { wdio } from '../src';

describe('@serenity-js/mocha', function () {

    this.timeout(30000);

    it('recognises a retryable scenario', () =>
        wdio(
            './examples/wdio.conf.ts',
            '--spec=examples/retries_passing_the_third_time.spec.ts',
            '--mochaOpts.retries=1',
        )
        .then(ifExitCodeIsOtherThan(1, logOutput))
        .then(res => {

            expect(res.exitCode).to.equal(1)

            PickEvent.from(StdOutReporter.parse(res.stdout))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario passes the third time')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionIgnored))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithError))
            ;
        }));

    it('recognises a retryable scenario', () =>
        wdio(
            './examples/wdio.conf.ts',
            '--spec=examples/retries_passing_the_third_time.spec.ts',
            '--mochaOpts.retries=2',
        )
        .then(ifExitCodeIsOtherThan(0, logOutput))
        .then(res => {

            expect(res.exitCode).to.equal(0);

            PickEvent.from(StdOutReporter.parse(res.stdout))
                .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario passes the third time')))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionIgnored))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionIgnored))
                .next(SceneFinished,       event => expect(event.outcome).to.be.instanceOf(ExecutionSuccessful))
            ;
        }));
});
