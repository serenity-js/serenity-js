import { DomainEvent } from '../src/events';
import { Stage, StageCrewMember } from '../src/stage';

export class Recorder implements StageCrewMember {

    constructor(
        public readonly events: DomainEvent[] = [],
        private stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): Recorder {
        this.stage = stage;

        return this;
    }

    notifyOf(event: DomainEvent): void {
        this.events.push(event);
    }
}
