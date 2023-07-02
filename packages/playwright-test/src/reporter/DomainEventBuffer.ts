import type { Stage, StageCrewMember } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';

export class DomainEventBuffer implements StageCrewMember {

    private events: DomainEvent[] = [];

    constructor(private stage?: Stage) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;

        return this;
    }

    notifyOf(event: DomainEvent): void {
        this.events.push(event);
    }

    flush(): DomainEvent[] {
        const events = [...this.events];

        this.events = [];

        return events;
    }
}
