import { UsesAbilities } from '@serenity-js/core';
import {
    ActivityFinished,
    ActivityStarts,
    ArtifactGenerated,
    AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed,
    DomainEvent,
} from '@serenity-js/core/lib/events';
import { CorrelationId, Description, Name, Photo } from '@serenity-js/core/lib/model';
import { StageManager } from '@serenity-js/core/lib/stage';
import { BrowseTheWeb } from '../../../screenplay';

export abstract class PhotoTakingStrategy {

    considerTakingPhoto(event: ActivityStarts | ActivityFinished, stageManager: StageManager, actor: UsesAbilities): void {
        if (this.shouldTakeAPhotoOf(event)) {
            const
                id          = CorrelationId.create(),
                photoName   = new Name(this.photoNameFor(event));

            stageManager.notifyOf(new AsyncOperationAttempted(
                new Description(`[Photographer:${ this.constructor.name }] Taking screenshot of '${ photoName.value }'...`),
                id,
            ));

            BrowseTheWeb.as(actor).takeScreenshot()
                .then(screenshot => {
                    stageManager.notifyOf(new ArtifactGenerated(
                        photoName,
                        Photo.fromBase64(screenshot),
                    ));

                    stageManager.notifyOf(new AsyncOperationCompleted(
                        new Description(`[${ this.constructor.name }] Took screenshot of '${ photoName.value }'`),
                        id,
                    ));
                })
                .catch(error => {
                    stageManager.notifyOf(new AsyncOperationFailed(error, id));
                });
        }
    }

    protected abstract shouldTakeAPhotoOf(event: DomainEvent): boolean;

    protected abstract photoNameFor(event: DomainEvent): string;
}
