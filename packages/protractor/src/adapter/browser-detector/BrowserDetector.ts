import { Stage } from '@serenity-js/core';
import { AsyncOperationAttempted, AsyncOperationCompleted, DomainEvent, SceneStarts, SceneTagged } from '@serenity-js/core/lib/events';
import { BrowserTag, CorrelationId, Description, PlatformTag } from '@serenity-js/core/lib/model';
import { StageCrewMember } from '@serenity-js/core/lib/stage';
import { protractor } from 'protractor';

/**
 * @private
 *
 * @see https://github.com/serenity-js/serenity-js/issues/455
 * @see https://github.com/serenity-bdd/serenity-core/pull/1860/files
 * @see https://github.com/serenity-js/serenity-js/issues/132
 */
export class BrowserDetector implements StageCrewMember {

    constructor(
        private readonly stage: Stage = null,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new BrowserDetector(stage);
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof SceneStarts) {
            const id = CorrelationId.create();

            this.stage.announce(new AsyncOperationAttempted(
                new Description(`[${ this.constructor.name }] Detecting web browser details...`),
                id,
                this.stage.currentTime(),
            ));

            protractor.browser.getCapabilities().then(capabilities => {
                const
                    platform = capabilities.get('platform'),
                    browserName = capabilities.get('browserName'),
                    browserVersion = capabilities.get('version');

                this.stage.announce(new SceneTagged(
                    event.value,
                    new BrowserTag(browserName, browserVersion),
                    this.stage.currentTime(),
                ));

                this.stage.announce(new SceneTagged(
                    event.value,
                    new PlatformTag(platform),
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
