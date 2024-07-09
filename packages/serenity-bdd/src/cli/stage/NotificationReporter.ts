import type { Stage, StageCrewMember } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import { ArtifactGenerated } from '@serenity-js/core/lib/events';

import { Complaint, Notification } from '../model';
import type { Printer } from '../Printer';

/**
 * Notifies the user of any `Notification` or `Complaint` type artifacts being reported.
 *
 * @package
 */
export class NotificationReporter implements StageCrewMember {
    constructor(
        private readonly printer: Printer,
        private readonly stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new NotificationReporter(this.printer, stage);
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof ArtifactGenerated && event.artifact instanceof Notification) {
            this.printer.info(event.artifact.map((notification: { message: string }) => notification.message));
        }

        else if (event instanceof ArtifactGenerated && event.artifact instanceof Complaint) {
            this.printer.error(event.artifact.map(({ description, message, stack }: { description: string, message: string, stack: string }) =>
                `${ description }\n${ stack }`));
        }
    }
}
