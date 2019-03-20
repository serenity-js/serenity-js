import { DomainEvent } from '../src/events';
import { StageCrewMember, StageManager } from '../src/stage';

export class Recorder implements StageCrewMember {

    constructor(
        public readonly events: DomainEvent[] = [],
        private readonly stageManager: StageManager = null,
    ) {
    }

    assignedTo(stageManager: StageManager) {
        return new Recorder(this.events, stageManager);
    }

    notifyOf(event: DomainEvent) {
        this.events.push(event);
    }
}
