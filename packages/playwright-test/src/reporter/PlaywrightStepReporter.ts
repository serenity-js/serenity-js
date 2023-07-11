import type { TestInfo } from '@playwright/test';
import type { Stage, StageCrewMember } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import {
    ActivityRelatedArtifactGenerated,
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    SceneTagged,
} from '@serenity-js/core/lib/events';
import type { Tag } from '@serenity-js/core/lib/model';
import { BrowserTag, CorrelationId, Description, Name, Photo, PlatformTag } from '@serenity-js/core/lib/model';

export class PlaywrightStepReporter implements StageCrewMember {

    constructor(
        private readonly testInfo: TestInfo,
        private stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;

        return this;
    }

    notifyOf(event: DomainEvent): void {

        if (event instanceof ActivityRelatedArtifactGenerated && event.artifact instanceof Photo) {
            this.attachPhotoFrom(event);
        }

        if (event instanceof SceneTagged && this.shouldAddTag(event.tag)) {
            this.addTag(event.tag);
        }
    }

    private attachPhotoFrom(event: ActivityRelatedArtifactGenerated) {
        const id = CorrelationId.create();

        this.stage.announce(new AsyncOperationAttempted(
            new Name(this.constructor.name),
            new Description(`Attaching screenshot of '${ event.name.value }'...`),
            id,
            this.stage.currentTime(),
        ));

        this.testInfo.attach(event.name.value, { body: Buffer.from(event.artifact.base64EncodedValue, 'base64'), contentType: 'image/png' })
            .then(() => {
                this.stage.announce(new AsyncOperationCompleted(
                    id,
                    this.stage.currentTime()
                ));
            });
    }

    private shouldAddTag(tag: Tag): boolean {
        // don't include platform and browser tags as Playwright already includes them
        return ! (tag instanceof PlatformTag || tag instanceof BrowserTag)
    }

    private addTag(tag: Tag): void {
        this.testInfo.annotations.push({ type: tag.type, description: tag.name });
    }
}
