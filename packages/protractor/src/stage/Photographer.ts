import { DomainEvent } from '@serenity-js/core/lib/events';
import { StageCrewMember, StageManager } from '@serenity-js/core/lib/stage';

export class Photographer implements StageCrewMember {
    constructor(private readonly stageManager: StageManager = null) {
    }

    assignedTo(stageManager: StageManager): StageCrewMember {
        return new Photographer(stageManager);
    }

    notifyOf(event: DomainEvent): void {
        throw new Error('Method not implemented.');
    }
}
