import fs from 'node:fs';
import path from 'node:path';

import type { Stage, StageCrewMember } from '@serenity-js/core';
import { type DomainEvent, TestRunFinished } from '@serenity-js/core/events';

export interface EventReceipt {
    receivedAt: number;
    type: string;
    details: string;
}

export class LiveEventsRecorder implements StageCrewMember {

    private readonly receipts: EventReceipt[] = [];

    constructor(
        private readonly outputPath: string,
        private stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;

        return this;
    }

    notifyOf(event: DomainEvent): void {
        this.receipts.push({
            receivedAt: Date.now(),
            type: event.constructor.name,
            details: JSON.stringify(event.toJSON()),
        });

        if (event instanceof TestRunFinished) {
            fs.mkdirSync(path.dirname(this.outputPath), { recursive: true });
            fs.writeFileSync(this.outputPath, JSON.stringify(this.receipts, undefined, 2));
        }
    }
}
