import { DomainEvent } from '../../../events';
import { StageCrewMember } from '../../StageCrewMember';
import { StageManager } from '../../StageManager';

export class DebugReporter implements StageCrewMember {
    constructor(private readonly stageManager: StageManager = null) {
    }

    assignedTo(stageManager: StageManager): StageCrewMember {
        return new DebugReporter(stageManager);
    }

    notifyOf(event: DomainEvent): void {
        console.log('[DebugReporter]', event.toString());   // tslint:disable-line:no-console
    }
}
