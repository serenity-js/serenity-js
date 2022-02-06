import { DomainEvent } from '@serenity-js/core/lib/events';
import { Stage, StageCrewMember } from '@serenity-js/core/lib/stage';
import { JSONObject } from 'tiny-types';

import { DTO } from './DTO';

export class ChildProcessReporter implements StageCrewMember {
    constructor(private readonly stage?: Stage) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new ChildProcessReporter(stage);
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
