import { DomainEvent } from '@serenity-js/core/events';
import { Stage, StageCrewMember } from '@serenity-js/core/stage';
import { JSONObject } from 'tiny-types';

import { DTO } from './DTO.js';

export class ChildProcessReporter implements StageCrewMember {
    private stage?: Stage;

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;
        return this;
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
