import path from 'node:path';

import { type FullConfig } from '@playwright/test';
import { type TestCase, type TestResult } from '@playwright/test/reporter';
import { Duration, LogicError, Timestamp } from '@serenity-js/core';
import {
    type DomainEvent,
    InteractionFinished,
    RetryableSceneDetected,
    SceneFinished,
    SceneTagged
} from '@serenity-js/core/lib/events';
import { Path } from '@serenity-js/core/lib/io';
import type {     CorrelationId,Outcome } from '@serenity-js/core/lib/model';
import {
    ArbitraryTag,
    ExecutionFailedWithAssertionError,
    ExecutionFailedWithError,
    ExecutionIgnored,
    ExecutionSkipped,
    ExecutionSuccessful
} from '@serenity-js/core/lib/model';
import { type JSONObject } from 'tiny-types';

import { WorkerEventStreamReader } from '../api/WorkerEventStreamReader';
import { WorkerEventStreamWriter } from '../api/WorkerEventStreamWriter';
import { EventFactory, PlaywrightSceneId } from '../events';
import { PlaywrightErrorParser } from './PlaywrightErrorParser';

export class PlaywrightEventBuffer {
    private readonly errorParser = new PlaywrightErrorParser();
    private readonly eventStreamReader = new WorkerEventStreamReader();

    private eventFactory: EventFactory;
    private readonly events = new Map<string, DomainEvent[]>();
    private readonly deferredSceneFinishedEvents = new Map<string, {
        event: SceneFinished;
        outputDirectory: string;
        workerIndex: number;
    }>();

    configure(config: Pick<FullConfig, 'rootDir'>): void {
        this.eventFactory = new EventFactory(Path.from(config.rootDir));
    }

    appendTestStart(test: TestCase, result: TestResult): void {
        this.events.set(
            this.sceneId(test, result).value,
            this.eventFactory.createSceneStartEvents(test, result),
        );
    }

    appendRetryableSceneEvents(test: TestCase, result: TestResult): void {
        const sceneId = this.sceneId(test, result);
        const sceneEndTime = new Timestamp(result.startTime).plus(Duration.ofMilliseconds(result.duration));

        this.events.get(sceneId.value).push(
            new RetryableSceneDetected(sceneId, sceneEndTime),
        );

        if (result.retry > 0 || result.status !== 'passed') {
            this.events.get(sceneId.value).push(
                new SceneTagged(
                    sceneId,
                    new ArbitraryTag('retried'), // todo: replace with a dedicated tag
                    sceneEndTime,
                ),
            );
        }
    }

    deferAppendingSceneFinishedEvent(test: TestCase, result: TestResult): void {
        const sceneId = this.sceneId(test, result);
        const scenarioOutcome = this.outcomeFrom(test, result);

        this.deferredSceneFinishedEvents.set(sceneId.value, {
            event: this.eventFactory.createSceneFinishedEvent(test, result, scenarioOutcome),
            outputDirectory: test.parent.project().outputDir,
            workerIndex: result.workerIndex,
        });
    }

    private determineScenarioOutcome(
        worstInteractionOutcome: Outcome,
        scenarioOutcome: Outcome,
    ): Outcome {
        if (worstInteractionOutcome instanceof ExecutionFailedWithAssertionError) {
            return worstInteractionOutcome;
        }

        if (worstInteractionOutcome instanceof ExecutionSkipped) {
            return worstInteractionOutcome;
        }

        return worstInteractionOutcome.isWorseThan(scenarioOutcome)
            ? worstInteractionOutcome
            : scenarioOutcome;
    }

    appendCrashedWorkerEvents(test: TestCase, result: TestResult): void {
        const workerStreamId = WorkerEventStreamWriter.workerStreamIdFor(result.workerIndex).value;
        const sceneId = this.sceneId(test, result);

        this.events.get(sceneId.value).push(
            ...this.readEventStream(
                test.parent.project().outputDir,
                workerStreamId,
                sceneId.value,
            ),
        );
    }

    appendSceneEvents(test: TestCase, result: TestResult): void {
        const sceneId = this.sceneId(test, result);
        this.events.get(sceneId.value).push(
            ...this.readEventStream(test.parent.project().outputDir, sceneId.value),
        );
    }

    private readEventStream(
        outputDirectory: string,
        streamId: string,
        expectedSceneId: string = streamId,
    ): DomainEvent[] {
        const pathToEventStreamFile = path.join(outputDirectory, 'serenity', streamId, 'events.ndjson');

        if (this.eventStreamReader.hasStream(pathToEventStreamFile)) {
            return this.eventStreamReader.read(
                pathToEventStreamFile,
                (event: { type: string, value: JSONObject }) => {
                    // re-attach events from orphaned beforeAll to the test case
                    const hasSceneId = event.value['sceneId'] !== undefined;
                    const isAttachedToScene = event.value['sceneId'] === expectedSceneId
                    if(hasSceneId && ! isAttachedToScene) {
                        event.value['sceneId'] = expectedSceneId;
                    }
                    return event;
                }
            );
        }

        return [];
    }

    appendSceneFinishedEvent(test: TestCase, result: TestResult): void {
        const sceneId = this.sceneId(test, result);
        const worstInteractionOutcome = this.determineWorstInteractionOutcome(this.events.get(sceneId.value));
        const scenarioOutcome = this.determineScenarioOutcome(
            worstInteractionOutcome,
            this.outcomeFrom(test, result),
        );

        this.events.get(sceneId.value).push(
            this.eventFactory.createSceneFinishedEvent(test, result, scenarioOutcome)
        );
    }

    flush(test: TestCase, result: TestResult): DomainEvent[] {
        const sceneId = this.sceneId(test, result);
        const events = this.events.get(sceneId.value);

        if (! events) {
            throw new LogicError(`No events found for test: ${ sceneId.value }`);
        }

        this.events.delete(sceneId.value);

        return events;
    }

    flushAllDeferred(): DomainEvent[] {
        const allEvents = [];

        for (const [ testId, events ] of this.events.entries()) {
            const scenarioEvents = [];

            scenarioEvents.push(...events);

            if (this.deferredSceneFinishedEvents.has(testId)) {
                const lastRecordedEvent = scenarioEvents.at(-1);
                const deferredSceneFinished = this.deferredSceneFinishedEvents.get(testId);

                const eventStream = this.readEventStream(
                    deferredSceneFinished.outputDirectory,
                    deferredSceneFinished.event.sceneId.value,
                );

                const firstEventSinceLastIndex = eventStream.findIndex(event => lastRecordedEvent.equals(event));
                const eventsSinceLast = firstEventSinceLastIndex === -1
                    ? eventStream
                    : eventStream.slice(firstEventSinceLastIndex);

                scenarioEvents.push(...eventsSinceLast);

                const worstInteractionOutcome = this.determineWorstInteractionOutcome(scenarioEvents);

                const sceneFinishedEvent = new SceneFinished(
                    deferredSceneFinished.event.sceneId,
                    deferredSceneFinished.event.details,
                    this.determineScenarioOutcome(worstInteractionOutcome, deferredSceneFinished.event.outcome),
                    deferredSceneFinished.event.timestamp,
                )

                scenarioEvents.push(sceneFinishedEvent);
            }

            allEvents.push(...scenarioEvents);
        }

        this.events.clear();
        this.deferredSceneFinishedEvents.clear();

        return allEvents;
    }

    private determineWorstInteractionOutcome(events: DomainEvent[]): Outcome {
        let worstInteractionOutcome: Outcome = new ExecutionSuccessful();
        for (const event of events) {
            if (event instanceof InteractionFinished && event.outcome.isWorseThan(worstInteractionOutcome)) {
                worstInteractionOutcome = event.outcome;
            }
        }
        return worstInteractionOutcome;
    }

    private outcomeFrom(test: TestCase, result: TestResult): Outcome {
        const outcome = test.outcome();

        if (outcome === 'skipped') {
            return new ExecutionSkipped();
        }

        if (outcome === 'unexpected' && result.status === 'passed') {
            return new ExecutionFailedWithError(
                new LogicError(`Scenario expected to fail, but ${ result.status }`),
            );
        }

        if ([ 'failed', 'interrupted', 'timedOut' ].includes(result.status)) {
            if (test.retries > result.retry) {
                return new ExecutionIgnored(this.errorParser.errorFrom(result.error));
            }

            return new ExecutionFailedWithError(
                this.errorParser.errorFrom(result.error),
            );
        }

        return new ExecutionSuccessful();
    }

    private sceneId(test: TestCase, result: TestResult): CorrelationId {
        return PlaywrightSceneId.from(test.parent.project()?.name, test, result);
    }
}
