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
import { error as webdriver } from 'selenium-webdriver';
import { BrowseTheWeb } from '../../../../screenplay';

/**
 * @desc
 *  Configures the {@link Photographer} to take photos (a.k.a. screenshots)
 *  of the {@link @serenity-js/core/lib/screenplay~Activity} performed
 *  by the {@link @serenity-js/core/lib/screenplay/actor~Actor} in the spotlight
 *  under specific conditions.
 *
 * @abstract
 */
export abstract class PhotoTakingStrategy {

    /**
     * @desc
     *  Takes a photo of the web browser held by the {@link @serenity-js/core/lib/screenplay/actor~Actor} in the spotlight.
     *
     * @param {@serenity-js/core/lib/events~ActivityStarts | @serenity-js/core/lib/events~ActivityFinished} event
     * @param {@serenity-js/core/lib/stage~Stage} stage - the Stage that holds reference to the Actor in the spotlight
     * @returns void
     *
     * @see {@serenity-js/core/lib/stage~Stage#theActorInTheSpotlight}
     */
    considerTakingPhoto(event: ActivityStarts | ActivityFinished, stage: Stage): void {
        if (this.shouldTakeAPhotoOf(event)) {
            let browseTheWeb: BrowseTheWeb;

            try {
                browseTheWeb = BrowseTheWeb.as(stage.theActorInTheSpotlight());
            } catch {
                return void 0;
            }

            const
                id              = CorrelationId.create(),
                nameSuffix      = this.photoNameFor(event);

            stage.announce(new AsyncOperationAttempted(
                new Description(`[Photographer:${ this.constructor.name }] Taking screenshot of '${ nameSuffix }'...`),
                id,
            ));

            Promise.all([
                browseTheWeb.takeScreenshot(),
                browseTheWeb.getCapabilities(),
            ]).then(([ screenshot, capabilities ]) => {

                const
                    context   = [ capabilities.get('platform'), capabilities.get('browserName'), capabilities.get('version') ],
                    photoName = this.combinedNameFrom(...context, nameSuffix);

                stage.announce(new ActivityRelatedArtifactGenerated(
                    event.sceneId,
                    event.activityId,
                    photoName,
                    Photo.fromBase64(screenshot),
                ));

                stage.announce(new AsyncOperationCompleted(
                    new Description(`[${ this.constructor.name }] Took screenshot of '${ nameSuffix }' on ${ context }`),
                    id,
                ));
            }).catch(error => {
                if (this.shouldIgnore(error)) {
                    stage.announce(new AsyncOperationCompleted(
                        new Description(`[${ this.constructor.name }] Aborted taking screenshot of '${ nameSuffix }' because of ${ error.constructor && error.constructor.name }`),
                        id,
                    ));
                }
                else {
                    stage.announce(new AsyncOperationFailed(error, id));
                }
            });
        }
    }

    protected abstract shouldTakeAPhotoOf(event: DomainEvent): boolean;

    protected abstract photoNameFor(event: DomainEvent): string;

    private combinedNameFrom(...parts: string[]): Name {
        return new Name(parts.filter(v => !! v).join('-'));
    }

    private shouldIgnore(error: Error) {
        return error instanceof webdriver.NoSuchSessionError
            || error instanceof webdriver.UnexpectedAlertOpenError
    }
}
