import { DomainEvent } from '@serenity-js/core/lib/events';
import { Stage, StageCrewMember } from '@serenity-js/core/lib/stage';

export class EventRecorder implements StageCrewMember {

    constructor(
        public readonly events: DomainEvent[] = [],
        private readonly stage: Stage = null,
    ) {
    }

    assignedTo(stage: Stage) {
        return new EventRecorder(this.events, stage);
    }

    notifyOf(event: DomainEvent) {
        this.events.push(event);
    }
}
