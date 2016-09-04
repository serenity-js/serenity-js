import { DomainEvent } from '../src/serenity/domain/events';
import { StageCrewMember } from '../src/stage_crew';

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
