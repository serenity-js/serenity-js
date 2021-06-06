import { DomainEvent } from '@serenity-js/core/lib/events';
import { Stage, StageCrewMember } from '@serenity-js/core/lib/stage';

export class EventRecorder implements StageCrewMember {

    constructor(
        public readonly events: DomainEvent[] = [],
        private readonly stage: Stage,
    ) {
    }

    assignedTo(stage: Stage): EventRecorder {
        return new EventRecorder(this.events, stage);
    }

    notifyOf(event: DomainEvent): void {
        this.events.push(event);
    }
}
