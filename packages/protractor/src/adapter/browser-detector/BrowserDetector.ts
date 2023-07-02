import type { Stage } from '@serenity-js/core';
import type { DomainEvent} from '@serenity-js/core/lib/events';
import { AsyncOperationAttempted, AsyncOperationCompleted, SceneStarts, SceneTagged } from '@serenity-js/core/lib/events';
import { BrowserTag, CorrelationId, Description, Name, PlatformTag } from '@serenity-js/core/lib/model';
import type { StageCrewMember } from '@serenity-js/core/lib/stage';

import type { StandardisedCapabilities } from './StandardisedCapabilities';

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
                new Name(this.constructor.name),
                new Description(`Detecting web browser details...`),
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
                    id,
                    this.stage.currentTime(),
                ));
            });
        }
    }
}
