import { LogicError } from '@serenity-js/core';
import { ActivityFinished, ActivityStarts, DomainEvent } from '@serenity-js/core/lib/events';
import { Stage, StageCrewMember } from '@serenity-js/core/lib/stage';
import { PhotoTakingStrategy } from './strategies';

export class Photographer implements StageCrewMember {
    constructor(
        private readonly photoTakingStrategy: PhotoTakingStrategy,
        private readonly stage: Stage = null,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new Photographer(this.photoTakingStrategy, stage);
    }

    notifyOf(event: DomainEvent): void {
        if (! this.stage) {
            throw new LogicError(`Photographer needs to be assigned to the Stage before it can be notified of any DomainEvents`);
        }

        if (! this.stage.theShowHasStarted()) {
            return void 0;
        }

        if (event instanceof ActivityStarts || event instanceof ActivityFinished) {
            this.photoTakingStrategy.considerTakingPhoto(event, this.stage);
        }
    }
}
