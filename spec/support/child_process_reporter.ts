import { DomainEvent } from '../../src/serenity/domain/events';
import { StageCrewMember } from '../../src/serenity/stage/stage_manager';

export class ChildProcessReporter implements StageCrewMember {
    assignTo(stage) {
        stage.manager.registerInterestIn([ DomainEvent ], this);
    }

    notifyOf(event) {
        process.send(event);
    }
}

export function childProcessReporter() {
    return new ChildProcessReporter();
}
