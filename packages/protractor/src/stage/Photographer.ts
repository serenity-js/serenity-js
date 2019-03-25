import {
    ArtifactGenerated,
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    DomainEvent,
    InteractionFinished,
} from '@serenity-js/core/lib/events';
import { CorrelationId, Description, ImplementationPending, Photo } from '@serenity-js/core/lib/model';
import { Stage, StageCrewMember } from '@serenity-js/core/lib/stage';
import { match } from 'tiny-types';
import { BrowseTheWeb } from '../screenplay/abilities';

export class Photographer implements StageCrewMember {
    constructor(private readonly stage: Stage = null) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new Photographer(stage);
    }

    notifyOf(event: DomainEvent): void {
        match<DomainEvent, void>(event)
            .when(InteractionFinished,   ({ value, outcome }: InteractionFinished) => {
                // todo: clean up
                if (this.stage.theShowHasStarted() && outcome.isWorseThan(ImplementationPending)) {

                    const id = CorrelationId.create();

                    this.stage.manager.notifyOf(new AsyncOperationAttempted(
                        new Description(`[${ this.constructor.name }] Taking screenshot of '${ value.name.value }'...`),
                        id,
                    ));

                    BrowseTheWeb.as(this.stage.theActorInTheSpotlight()).takeScreenshot()
                        .then(screenshot => {
                            this.stage.manager.notifyOf(new ArtifactGenerated(
                                value.name,
                                Photo.fromBase64(screenshot),
                            ));

                            this.stage.manager.notifyOf(new AsyncOperationCompleted(
                                new Description(`[${ this.constructor.name }] Took screenshot of '${ value.name.value }'`),
                                id,
                            ));
                        })
                        .catch(error => {
                            this.stage.manager.notifyOf(new AsyncOperationFailed(error, id));
                        });
                }
            })
            .else(() => /* ignore */ void 0);
    }
}
