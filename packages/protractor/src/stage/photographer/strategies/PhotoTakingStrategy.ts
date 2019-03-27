import { Stage } from '@serenity-js/core';
import {
    ActivityFinished,
    ActivityRelatedArtifactGenerated,
    ActivityStarts,
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    DomainEvent,
} from '@serenity-js/core/lib/events';
import { CorrelationId, Description, Name, Photo } from '@serenity-js/core/lib/model';
import { BrowseTheWeb } from '../../../screenplay';

export abstract class PhotoTakingStrategy {

    considerTakingPhoto(event: ActivityStarts | ActivityFinished, stage: Stage): void {
        if (this.shouldTakeAPhotoOf(event)) {
            const
                id          = CorrelationId.create(),
                photoName   = new Name(this.photoNameFor(event));

            stage.announce(new AsyncOperationAttempted(
                new Description(`[Photographer:${ this.constructor.name }] Taking screenshot of '${ photoName.value }'...`),
                id,
            ));

            BrowseTheWeb.as(stage.theActorInTheSpotlight()).takeScreenshot()
                .then(screenshot => {
                    stage.announce(new ActivityRelatedArtifactGenerated(
                        event.value,
                        photoName,
                        Photo.fromBase64(screenshot),
                    ));

                    stage.announce(new AsyncOperationCompleted(
                        new Description(`[${ this.constructor.name }] Took screenshot of '${ photoName.value }'`),
                        id,
                    ));
                })
                .catch(error => {
                    stage.announce(new AsyncOperationFailed(error, id));
                });
        }
    }

    protected abstract shouldTakeAPhotoOf(event: DomainEvent): boolean;

    protected abstract photoNameFor(event: DomainEvent): string;
}
