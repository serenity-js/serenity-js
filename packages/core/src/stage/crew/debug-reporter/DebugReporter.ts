import { DomainEvent } from '../../../events';
import { StageCrewMember } from '../../StageCrewMember';
import { StageManager } from '../../StageManager';

export class DebugReporter implements StageCrewMember {
    private stageManager: StageManager;

    assignTo(stageManager: StageManager) {
        this.stageManager = stageManager;
        this.stageManager.register(this);
    }

    notifyOf(event: DomainEvent): void {
        console.log('[DebugReporter]', event.toString());   // tslint:disable-line:no-console
    }
}
