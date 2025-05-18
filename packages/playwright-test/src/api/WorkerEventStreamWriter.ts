import * as fs from 'node:fs';
import * as path from 'node:path';

import type { TestCase } from '@playwright/test/reporter';
import type { Stage, StageCrewMember } from '@serenity-js/core';
import { LogicError } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import { CorrelationId } from '@serenity-js/core/lib/model';

export class WorkerEventStreamWriter implements StageCrewMember {

    private static beforeTest = new CorrelationId('unknown');
    private activeSceneId: CorrelationId = WorkerEventStreamWriter.beforeTest;

    private events: Map<TestCase['id'], DomainEvent[]> = new Map([
        [ WorkerEventStreamWriter.beforeTest.value, [] ],
    ]);

    constructor(
        private readonly outputDirectory: string,
        private stage?: Stage,
    ) {
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
            ...this.events.get(WorkerEventStreamWriter.beforeTest.value),
        );

        this.events.set(WorkerEventStreamWriter.beforeTest.value, []);
    }

    async persistAll(): Promise<void> {
        const testIds = [...this.events.keys()];

        await Promise.all(testIds.map(testId => this.persist(testId)));
    }

    async persist(testId: TestCase['id']): Promise<void> {
        const testOutputDirectory = path.join(this.outputDirectory, testId);
        await fs.promises.mkdir(testOutputDirectory, { recursive: true })

        const filePath = path.join(testOutputDirectory, 'events.ndjson');

        const events = this.flush(testId);

        for (const event of events) {
            const serialisedEvent = JSON.stringify({
                type: event.constructor.name,
                value: event.toJSON(),
            }, undefined, 0);

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
