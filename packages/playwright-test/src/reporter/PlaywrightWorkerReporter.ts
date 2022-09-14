import { test as base } from '@playwright/test';
import { Stage, StageCrewMember } from '@serenity-js/core';
import { DomainEvent } from '@serenity-js/core/lib/events';

import { SERENITY_JS_DOMAIN_EVENT_ATTACHMENT_CONTENT_TYPE } from './PlaywrightAttachments';

export class PlaywrightWorkerReporter implements StageCrewMember {

    constructor(
        private readonly testInfo = base.info, 
        private stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;

        return this;
    }

    notifyOf(event: DomainEvent): void {
        try {
            this.testInfo().attach('serenity-js-event.json', {
                contentType: SERENITY_JS_DOMAIN_EVENT_ATTACHMENT_CONTENT_TYPE,
                body: Buffer.from(
                    JSON.stringify({
                        type: event.constructor.name,
                        value: event.toJSON()
                    }), 
                    'utf8'
                ),
            });
        }
        catch {
            // no test info available, ignore
        }
    }
}