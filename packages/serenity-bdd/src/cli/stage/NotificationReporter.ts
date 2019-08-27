import { Stage, StageCrewMember } from '@serenity-js/core';
import { ArtifactGenerated, DomainEvent } from '@serenity-js/core/lib/events';
import { Complaint, Notification } from '../model';
import { Printer } from '../Printer';

/**
 * @desc
 *  Notifies the user of any {@link Notification} or {@link Complaint} type artifacts being reported.
 *
 * @package
 */
export class NotificationReporter implements StageCrewMember {
    constructor(
        private readonly printer: Printer,
        private readonly stage: Stage = null,
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
            this.printer.info(event.artifact.map(({ description, message }: { description: string, message: string }) =>
                `${ description }\n${ message }`));
            // todo: add stack if verbose
        }

        else {
            // todo depending on log level, print tasks only, or tasks and interactions
            // console.log(`[ProgressReporter] ${ event.constructor.name } ${ JSON.stringify(event.toJSON(), null, 0) }`);
        }
    }
}
