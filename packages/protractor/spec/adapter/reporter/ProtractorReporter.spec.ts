import 'mocha';

import { expect } from '@integration/testing-tools';
import { AssertionError, Duration, ImplementationPendingError, TestCompromisedError } from '@serenity-js/core';
import { SceneFinished, SceneStarts } from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import {
    Category,
    CorrelationId,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Name,
    Outcome,
    ProblemIndication,
    ScenarioDetails,
    Timestamp,
} from '@serenity-js/core/lib/model';
import { given } from 'mocha-testdata';
import { Runner } from 'protractor';
import * as sinon from 'sinon';

import { ProtractorReporter } from '../../../src/adapter/reporter';

/**
 * See the {@link ProtractorFrameworkAdapter} specs to see how the {@link ProtractorReporter} is used in the context
 */
describe('ProtractorReporter', () => {

    const
        id = CorrelationId.create(),
        details = new ScenarioDetails(
            new Name('example scenario'),
            new Category('example category'),
            new FileSystemLocation(new Path('./some/scenario.spec.ts')),
        ),
        now = Timestamp.fromMillisecondTimestamp(0),
        later = now.plus(Duration.ofMilliseconds(1)),

        executionSuccessful     = new ExecutionSuccessful(),
        executionSkipped        = new ExecutionSkipped(),
        executionIgnored        = new ExecutionIgnored(thrown(new Error('Execution ignored'))),
        implementationPending   = new ImplementationPending(thrown(new ImplementationPendingError('Step missing'))),
        failedWithAssertion     = new ExecutionFailedWithAssertionError(thrown(new AssertionError('Expected false to be true', true, false))),
        failedWithError         = new ExecutionFailedWithError(thrown(new Error(`We're sorry, something happened`))),
        compromised             = new ExecutionCompromised(thrown(new TestCompromisedError('DB is down')));

    function thrown<T extends Error>(error: T): T {
        try {
            throw error;
        } catch (thrownError) {
            return thrownError;
        }
    }

    describe('with default threshold', () => {

        given([
            executionSuccessful,
            executionSkipped,
        ]).
        it(`considers a scenario to be successful when its outcome is better that the success threshold`, (outcome: Outcome) => {

            const reporter = new ProtractorReporter(sinon.createStubInstance(Runner));

            reporter.notifyOf(new SceneStarts(id, details, now));
            reporter.notifyOf(new SceneFinished(id, details, outcome, later));

            expect(reporter.report()).to.deep.equal({
                failedCount: 0,
                specResults: [{
                    assertions: [{
                        passed: true,
                    }],
                    description: 'example category example scenario',
                    duration: 1,
                }],
            });
        });

        given([
            executionIgnored,
            implementationPending,
            failedWithAssertion,
            failedWithError,
            compromised,
        ]).
        it(`considers a scenario to be unsuccessful when its outcome is worse that the success threshold`, (outcome: ProblemIndication) => {

            const reporter = new ProtractorReporter(sinon.createStubInstance(Runner));

            reporter.notifyOf(new SceneStarts(id, details, now));
            reporter.notifyOf(new SceneFinished(id, details, outcome, later));

            expect(reporter.report()).to.deep.equal({
                failedCount: 1,
                specResults: [{
                    assertions: [{
                        passed: false,
                        errorMsg: outcome.error.message,
                        stackTrace: outcome.error.stack,
                    }],
                    description: 'example category example scenario',
                    duration: 1,
                }],
            });
        });
    });

    describe('with custom threshold', () => {

        const successThreshold = implementationPending;

        given([
            executionSuccessful,
            executionSkipped,
            executionIgnored,
            implementationPending,
        ]).
        it(`considers a scenario to be successful when its outcome is better that the success threshold`, (outcome: Outcome) => {

            const reporter = new ProtractorReporter(sinon.createStubInstance(Runner), successThreshold);

            reporter.notifyOf(new SceneStarts(id, details, now));
            reporter.notifyOf(new SceneFinished(id, details, outcome, later));

            expect(reporter.report()).to.deep.equal({
                failedCount: 0,
                specResults: [{
                    assertions: [{
                        passed: true,
                    }],
                    description: 'example category example scenario',
                    duration: 1,
                }],
            });
        });

        given([
            failedWithAssertion,
            failedWithError,
            compromised,
        ]).
        it(`considers a scenario to be unsuccessful when its outcome is worse that the success threshold`, (outcome: ProblemIndication) => {

            const reporter = new ProtractorReporter(sinon.createStubInstance(Runner), successThreshold);

            reporter.notifyOf(new SceneStarts(id, details, now));
            reporter.notifyOf(new SceneFinished(id, details, outcome, later));

            expect(reporter.report()).to.deep.equal({
                failedCount: 1,
                specResults: [{
                    assertions: [{
                        passed: false,
                        errorMsg: outcome.error.message,
                        stackTrace: outcome.error.stack,
                    }],
                    description: 'example category example scenario',
                    duration: 1,
                }],
            });
        });
    });
});
