import fs from 'node:fs';
import path from 'node:path';

import { type WorkerInfo } from '@playwright/test';
import type { TestCase } from '@playwright/test/reporter';
import type { Stage, StageCrewMember } from '@serenity-js/core';
import { LogicError } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import { CorrelationId } from '@serenity-js/core/lib/model';
import type { JSONObject } from 'tiny-types';

export class WorkerEventStreamWriter implements StageCrewMember {

    private readonly beforeAllId: CorrelationId; //  = new CorrelationId('unknown');
    private activeSceneId: CorrelationId; // = WorkerEventStreamWriter.beforeTest;

    private events: Map<TestCase['id'], DomainEvent[]> = new Map();

    static workerStreamIdFor(workerIndex: number): CorrelationId {
        return new CorrelationId(`worker-${ workerIndex }`);
    }

    constructor(
        private readonly outputDirectory: string,
        private readonly workerInfo: WorkerInfo,
        private stage?: Stage,
    ) {

        this.beforeAllId = WorkerEventStreamWriter.workerStreamIdFor(this.workerInfo.workerIndex);
        this.activeSceneId = this.beforeAllId;
        this.events.set(this.beforeAllId.value, []);
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;

        return this;
    }

    notifyOf(event: DomainEvent): void {

        if (this.isSceneEvent(event) && ! this.activeSceneExistsFor(event)) {
            this.activateScene(event);
        }

        this.events.get(this.activeSceneId.value).push(event);
    }

    private isSceneEvent(event: DomainEvent & { sceneId?: CorrelationId }): event is DomainEvent & { sceneId: CorrelationId } {
        return event['sceneId'] instanceof CorrelationId;
    }

    private activeSceneExistsFor(event: DomainEvent & { sceneId: CorrelationId }): boolean {
        return this.activeSceneId.equals(event.sceneId);
    }

    private activateScene(event: DomainEvent & { sceneId: CorrelationId }): void {
        this.activeSceneId = event.sceneId;

        const testId = event.sceneId.value;

        if (! this.events.has(testId)) {
            this.events.set(testId, []);
        }

        this.events.get(testId).push(
            ...this.events.get(this.beforeAllId.value),
        );

        this.events.set(this.beforeAllId.value, []);
    }

    async persistAll(workerBeforeAllSceneId: CorrelationId): Promise<void> {
        const testIds = [...this.events.keys()];

        await Promise.all(testIds.map(testId => this.persist(testId, workerBeforeAllSceneId)));
    }

    async persist(testId: TestCase['id'], workerBeforeAllSceneId?: CorrelationId): Promise<void> {
        const testOutputDirectory = path.join(this.outputDirectory, testId);

        const filePath = path.join(testOutputDirectory, 'events.ndjson');

        const events = this.flush(testId);

        if (events.length === 0) {
            return;
        }

        await fs.promises.mkdir(testOutputDirectory, { recursive: true })

        for (const event of events) {
            const shouldReattachToScene = event['sceneId'] && event['sceneId'].equals(workerBeforeAllSceneId);

            const type = event.constructor.name;

            const value = shouldReattachToScene
                ? ({ ...(event.toJSON() as JSONObject), sceneId: testId })
                : event.toJSON();

            const serialisedEvent = JSON.stringify({ type, value }, undefined, 0);

            await fs.promises.appendFile(filePath, serialisedEvent + '\n');
        }
    }

    private flush(testId: TestCase['id']): DomainEvent[] {
        if (! this.events.has(testId)) {
            throw new LogicError(`No events recorded for test with id ${ testId }`);
        }

        const events = this.events.get(testId);
        this.events.set(testId, []);

        return events;
    }
}
