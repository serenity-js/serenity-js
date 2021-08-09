/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AssertionError, ImplementationPendingError, StageCrewMember, TestCompromisedError } from '@serenity-js/core';
import { DomainEvent, RetryableSceneDetected, SceneFinished, SceneStarts, TestRunFinished, TestRunFinishes, TestRunStarts, TestSuiteFinished, TestSuiteStarts } from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import {
    Category,
    CorrelationId,
    Duration,
    ExecutionCompromised,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful,
    ImplementationPending,
    Name,
    Outcome,
    ScenarioDetails,
    TestSuiteDetails,
    Timestamp
} from '@serenity-js/core/lib/model';

function thrown<T extends Error>(error: T): T {
    try {
        throw error;
    } catch (error_) {
        return error_;
    }
}

export function when(stageCrewMember: StageCrewMember) {
    return {
        receives(...events: DomainEvent[]) {
            events.forEach(event => {
                stageCrewMember.notifyOf(event);
            });
        }
    }
}

export const
    startTime = Timestamp.fromMillisecondTimestamp(0),
    cid = '0-0',
    successThreshold: Outcome | { Code: number } = ExecutionIgnored,

    scene1Id = CorrelationId.create(),
    scene2Id = CorrelationId.create(),
    scenario1Details = new ScenarioDetails(
        new Name('Paying with a default card'),
        new Category('Online Checkout'),
        new FileSystemLocation(
            new Path(`payments/checkout.feature`),
            3,
        ),
    ),
    scenario2Details = new ScenarioDetails(
        new Name('Paying with a voucher'),
        new Category('Online Checkout'),
        new FileSystemLocation(
            new Path(`payments/checkout.feature`),
            10,
        ),
    ),
    categoryUID = 'payments/checkout.feature:Online Checkout',

    scene1Duration = Duration.ofMilliseconds(500),
    scene2Duration = Duration.ofMilliseconds(250),

    testRunStarts           = new TestRunStarts(startTime),
    scene1Starts            = new SceneStarts(scene1Id, scenario1Details, startTime),
    scene1FinishedWith      = (outcome: Outcome) =>
        new SceneFinished(scene1Id, scenario1Details, outcome, startTime.plus(scene1Duration)),
    scene2Starts            = new SceneStarts(scene2Id, scenario2Details, startTime.plus(scene1Duration)),
    scene2FinishedWith      = (outcome: Outcome) =>
        new SceneFinished(scene2Id, scenario2Details, outcome, startTime.plus(scene1Duration).plus(scene2Duration)),
    testRunFinishes         = new TestRunFinishes(startTime.plus(scene1Duration).plus(scene2Duration)),
    testRunFinished         = new TestRunFinished(startTime.plus(scene1Duration).plus(scene2Duration)),

    retryableSceneStarts        = (index: number) =>
        new SceneStarts(new CorrelationId(`${ index }`), scenario1Details, startTime.plus(Duration.ofSeconds(index))),
    retryableSceneDetected      = (index: number) =>
        new RetryableSceneDetected(new CorrelationId(`${ index }`), startTime.plus(Duration.ofSeconds(index))),
    retryableSceneFinishedWith  = (index: number, outcome: Outcome) =>
        new SceneFinished(new CorrelationId(`${ index }`), scenario1Details, outcome, startTime.plus(Duration.ofSeconds(index)).plus(scene1Duration)),

    testSuiteStarts = (index: number, name: string) =>
        new TestSuiteStarts(
            new TestSuiteDetails(
                new Name(name),
                new FileSystemLocation(
                    new Path(`payments/checkout.feature`),
                ),
                new CorrelationId(`suite-${ index }`),
            ),
            startTime.plus(Duration.ofSeconds(index))
        ),
    testSuiteFinished = (index: number, name: string, outcome: Outcome) =>
        new TestSuiteFinished(
            new TestSuiteDetails(
                new Name(name),
                new FileSystemLocation(
                    new Path(`payments/checkout.feature`),
                ),
                new CorrelationId(`suite-${ index }`),
            ),
            outcome,
            startTime.plus(Duration.ofSeconds(index).plus(scene1Duration))
        ),

    executionSuccessful             = new ExecutionSuccessful(),
    executionSkipped                = new ExecutionSkipped(),
    executionIgnored                = new ExecutionIgnored(thrown(new Error('Execution failed but will be retried'))),
    implementationPending           = new ImplementationPending(thrown(new ImplementationPendingError('Step missing'))),
    executionFailedWithAssertionError    = new ExecutionFailedWithAssertionError(thrown(new AssertionError('Expected false to be true', true, false))),
    executionFailedWithError        = new ExecutionFailedWithError(thrown(new Error(`We're sorry, something happened`))),
    executionCompromised            = new ExecutionCompromised(thrown(new TestCompromisedError('DB is down')))
;
