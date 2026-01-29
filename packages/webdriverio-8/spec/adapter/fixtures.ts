/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { StageCrewMember} from '@serenity-js/core';
import { AssertionError, Duration, ImplementationPendingError, TestCompromisedError, Timestamp } from '@serenity-js/core';
import type { DomainEvent} from '@serenity-js/core/lib/events/index.js';
import { RetryableSceneDetected, SceneFinished, SceneFinishes, SceneStarts, TestRunFinished, TestRunFinishes, TestRunStarts, TestSuiteFinished, TestSuiteStarts } from '@serenity-js/core/lib/events/index.js';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io/index.js';
import type {
    Outcome} from '@serenity-js/core/lib/model/index.js';
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
    ScenarioDetails,
    TestSuiteDetails,
} from '@serenity-js/core/lib/model/index.js';

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
    startTime = Timestamp.fromTimestampInMilliseconds(0),
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
    scene1FinishesWith      = (outcome: Outcome) =>
        new SceneFinishes(scene1Id, outcome, startTime.plus(scene1Duration)),
    scene1FinishedWith      = (outcome: Outcome) =>
        new SceneFinished(scene1Id, scenario1Details, outcome, startTime.plus(scene1Duration)),
    scene2Starts            = new SceneStarts(scene2Id, scenario2Details, startTime.plus(scene1Duration)),
    scene2FinishesWith      = (outcome: Outcome) =>
        new SceneFinishes(scene2Id, outcome, startTime.plus(scene1Duration).plus(scene2Duration)),
    scene2FinishedWith      = (outcome: Outcome) =>
        new SceneFinished(scene2Id, scenario2Details, outcome, startTime.plus(scene1Duration).plus(scene2Duration)),
    testRunFinishes         = new TestRunFinishes(startTime.plus(scene1Duration).plus(scene2Duration)),
    testRunFinished         = new TestRunFinished(new ExecutionSuccessful(), startTime.plus(scene1Duration).plus(scene2Duration)),

    retryableSceneStarts        = (index: number) =>
        new SceneStarts(new CorrelationId(`${ index }`), scenario1Details, startTime.plus(Duration.ofSeconds(index))),
    retryableSceneDetected      = (index: number) =>
        new RetryableSceneDetected(new CorrelationId(`${ index }`), startTime.plus(Duration.ofSeconds(index))),
    retryableSceneFinishesWith  = (index: number, outcome: Outcome) =>
        new SceneFinishes(new CorrelationId(`${ index }`), outcome, startTime.plus(Duration.ofSeconds(index)).plus(scene1Duration)),
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
    executionFailedWithAssertionError    = new ExecutionFailedWithAssertionError(thrown(new AssertionError('Expected false to be true'))),
    executionFailedWithError        = new ExecutionFailedWithError(thrown(new Error(`We're sorry, something happened`))),
    executionCompromised            = new ExecutionCompromised(thrown(new TestCompromisedError('DB is down')))
;
