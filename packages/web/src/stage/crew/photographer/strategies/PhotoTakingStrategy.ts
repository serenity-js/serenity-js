import type { Stage } from '@serenity-js/core';
import { LogicError } from '@serenity-js/core';
import type { ActivityFinished, ActivityStarts, DomainEvent } from '@serenity-js/core/lib/events';
import { ActivityRelatedArtifactGenerated, AsyncOperationAborted, AsyncOperationAttempted, AsyncOperationCompleted, AsyncOperationFailed } from '@serenity-js/core/lib/events';
import { CorrelationId, Description, Name, Photo } from '@serenity-js/core/lib/model';

import { BrowseTheWeb } from '../../../../screenplay';

/**
 * Configures the {@apilink Photographer} to take {@apilink Photo|photos}, a.k.a. screenshots,
 * of the {@apilink Activity} performed by the {@apilink Actor} in the {@apilink actorInTheSpotlight|spotlight}
 * when desired conditions are met.
 *
 * @group Stage
 */
export abstract class PhotoTakingStrategy {

    /**
     * Takes a photo of the web browser used by the {@apilink Actor} in the {@apilink actorInTheSpotlight|spotlight}.
     *
     * #### Learn more
     * - {@apilink ActivityStarts}
     * - {@apilink ActivityFinished}
     * - {@apilink Stage}
     *
     * @param event
     * @param stage
     *  The Stage that holds reference to the Actor in the spotlight
     */
    async considerTakingPhoto(event: ActivityStarts | ActivityFinished, stage: Stage): Promise<void> {
        if (! this.shouldTakeAPhotoOf(event)) {
            return void 0;
        }

        let browseTheWeb: BrowseTheWeb;

        try {
            browseTheWeb = BrowseTheWeb.as(stage.theActorInTheSpotlight());
        } catch {
            // actor doesn't have a browser, abort
            return void 0;
        }

        const
            id              = CorrelationId.create(),
            nameSuffix      = this.photoNameFor(event);

        stage.announce(new AsyncOperationAttempted(
            new Name(`Photographer:${ this.constructor.name }`),
            new Description(`Taking screenshot of '${ nameSuffix }'...`),
            id,
            stage.currentTime(),
        ));

        try {
            const capabilities  = await browseTheWeb.browserCapabilities();
            const page          = await browseTheWeb.currentPage();
            const screenshot    = await page.takeScreenshot();

            const
                context   = [ capabilities.platformName, capabilities.browserName, capabilities.browserVersion ],
                photoName = this.combinedNameFrom(...context, nameSuffix);

            stage.announce(new ActivityRelatedArtifactGenerated(
                event.sceneId,
                event.activityId,
                photoName,
                Photo.fromBase64(screenshot),
                stage.currentTime(),
            ));

            return stage.announce(new AsyncOperationCompleted(
                id,
                stage.currentTime(),
            ));
        }
        catch (error) {
            if (this.shouldIgnore(error)) {
                stage.announce(new AsyncOperationAborted(
                    new Description(`Aborted taking screenshot of '${ nameSuffix }' because of ${ error.constructor && error.constructor.name }`),
                    id,
                    stage.currentTime(),
                ));
            }
            else {
                stage.announce(new AsyncOperationFailed(error, id, stage.currentTime()));
            }
        }
    }

    protected abstract shouldTakeAPhotoOf(event: DomainEvent): boolean;

    protected abstract photoNameFor(event: DomainEvent): string;

    private combinedNameFrom(...parts: string[]): Name {
        return new Name(parts.filter(v => !! v).join('-'));
    }

    private shouldIgnore(error: Error) {
        return error instanceof LogicError
            || (error.name && error.name === LogicError.name);
    }
}
