import { DomainEvent } from '../../../events';
import { Stage } from '../../Stage';
import { StageCrewMember } from '../../StageCrewMember';

export class DebugReporter implements StageCrewMember {
    constructor(private readonly stage: Stage = null) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new DebugReporter(stage);
    }

    notifyOf(event: DomainEvent): void {
        console.log('[DebugReporter]', event.toString());   // tslint:disable-line:no-console
    }
}
