import { DomainEvent } from '../src/events';
import { StageCrewMember, StageManager } from '../src/stage';

export class Recorder implements StageCrewMember {

    public readonly events: DomainEvent[] = [];

    assignTo(stageManager: StageManager) {
        // no-op
    }

    notifyOf(event: DomainEvent) {
        this.events.push(event);
    }
}
