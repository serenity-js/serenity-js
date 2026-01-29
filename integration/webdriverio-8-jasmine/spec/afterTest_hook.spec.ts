import { expect, ifExitCodeIsOtherThan, logOutput, parseMarkedOutput, PickEvent, StdOutReporter } from '@integration/testing-tools';
import { Timestamp } from '@serenity-js/core';
import { SceneFinished, SceneStarts, TestRunFinished } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithAssertionError, ExecutionSuccessful, Name } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import { wdio } from '../src';

describe('@serenity-js/webdriverio-8 with Jasmine', function () {

    this.timeout(60_000);

    const AFTER_TEST_MARKER = '[AfterTest]';

    interface AfterTestOutput {
        title?: string;
        passed?: boolean;
        event?: string;
        duration?: number;
    }

    describe('afterTest hook', () => {

        it('is invoked with correct result for a passing scenario', () =>
            wdio(
                './examples/wdio.afterTest.conf.ts',
                '--spec=examples/passing.spec.js',
            )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                // Verify Serenity/JS events
                PickEvent.from(StdOutReporter.parse(result.stdout))
                    .next(SceneStarts,      event => expect(event.details.name).to.equal(new Name('A scenario passes')))
                    .next(SceneFinished,    event => expect(event.outcome).to.equal(new ExecutionSuccessful()))
                    .next(TestRunFinished,  event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;

                // Verify afterTest hook was invoked with correct parameters
                const afterTestOutput = parseMarkedOutput<AfterTestOutput>(result.stdout, AFTER_TEST_MARKER);

                expect(afterTestOutput).to.have.length.greaterThanOrEqual(2);

                const hookInvocation = afterTestOutput.find(o => o.title === 'passes');
                expect(hookInvocation).to.exist;
                expect(hookInvocation.passed).to.equal(true);

                // Verify the async operation in afterTest completed (hook was awaited)
                const hookCompletion = afterTestOutput.find(o => o.event === 'completed' && o.title === 'passes');
                expect(hookCompletion).to.exist;
            }));

        it('is invoked with correct result for a failing scenario', () =>
            wdio(
                './examples/wdio.afterTest.conf.ts',
                '--spec=examples/failing.spec.js',
            )
            .then(ifExitCodeIsOtherThan(1, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(1);

                // Verify Serenity/JS events
                PickEvent.from(StdOutReporter.parse(result.stdout))
                    .next(SceneStarts,      event => expect(event.details.name).to.equal(new Name('A scenario fails')))
                    .next(SceneFinished,    event => expect(event.outcome).to.be.instanceOf(ExecutionFailedWithAssertionError))
                    .next(TestRunFinished,  event => expect(event.timestamp).to.be.instanceof(Timestamp))
                ;

                // Verify afterTest hook was invoked with correct parameters
                const afterTestOutput = parseMarkedOutput<AfterTestOutput>(result.stdout, AFTER_TEST_MARKER);

                expect(afterTestOutput).to.have.length.greaterThanOrEqual(2);

                const hookInvocation = afterTestOutput.find(o => o.title === 'fails');
                expect(hookInvocation).to.exist;
                expect(hookInvocation.passed).to.equal(false);

                // Verify the async operation in afterTest completed (hook was awaited)
                const hookCompletion = afterTestOutput.find(o => o.event === 'completed' && o.title === 'fails');
                expect(hookCompletion).to.exist;
            }));
    });
});
