import { Stage } from '@serenity-js/core';
import { AsyncOperationAttempted, AsyncOperationCompleted, DomainEvent, SceneStarts, SceneTagged } from '@serenity-js/core/lib/events';
import { BrowserTag, CorrelationId, Description, PlatformTag } from '@serenity-js/core/lib/model';
import { StageCrewMember } from '@serenity-js/core/lib/stage';
import { StandardisedCapabilities } from './StandardisedCapabilities';

/**
 * @private
 *
 * @see https://github.com/serenity-js/serenity-js/issues/455
 * @see https://github.com/serenity-bdd/serenity-core/pull/1860/files
 * @see https://github.com/serenity-js/serenity-js/issues/132
 */
export class BrowserDetector implements StageCrewMember {

    static with(capabilities: StandardisedCapabilities): BrowserDetector {
        return new BrowserDetector(capabilities);
    }

    constructor(
        private readonly capabilities: StandardisedCapabilities,
        private stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new BrowserDetector(this.capabilities, stage);
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof SceneStarts) {
            const id = CorrelationId.create();

            this.stage.announce(new AsyncOperationAttempted(
                new Description(`[${ this.constructor.name }] Detecting web browser details...`),
                id,
                this.stage.currentTime(),
            ));

            Promise.all([
                this.capabilities.browserName(),
                this.capabilities.browserVersion(),
                this.capabilities.platformName(),
                this.capabilities.platformVersion(),
            ]).
            then(([browserName, browserVersion, platformName, platformVersion]) => {

                this.stage.announce(new SceneTagged(
                    event.sceneId,
                    new BrowserTag(browserName, browserVersion),
                    this.stage.currentTime(),
                ));

                this.stage.announce(new SceneTagged(
                    event.sceneId,
                    new PlatformTag(platformName, platformVersion),
                    this.stage.currentTime(),
                ));

                this.stage.announce(new AsyncOperationCompleted(
                    new Description(`[${ this.constructor.name }] Detected web browser details`),
                    id,
                    this.stage.currentTime(),
                ));
            });
        }
    }
}
