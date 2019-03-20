import { DomainEvent } from '@serenity-js/core/lib/events';
import { StageCrewMember, StageManager } from '@serenity-js/core/lib/stage';
import { JSONObject } from 'tiny-types';
import { DTO } from './DTO';

export class ChildProcessReporter implements StageCrewMember {
    private stageManager: StageManager;

    assignTo(stageManager: StageManager) {
        this.stageManager = stageManager;
    }

    notifyOf(event: DomainEvent): void {
        process.send(this.serialised(event));
    }

    private serialised(event: DomainEvent): DTO {
        return ({
            type:  event.constructor.name,
            value: event.toJSON() as JSONObject,
        });
    }
}
