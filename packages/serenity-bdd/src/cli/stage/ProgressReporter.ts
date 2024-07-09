import type { Stage, StageCrewMember } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/lib/events';
import { ArtifactGenerated } from '@serenity-js/core/lib/events';
import ProgressBar from 'progress';

import { DownloadProgressReport } from '../model';
import type { Printer } from '../Printer';

/**
 * Notifies the user of the progress of the Serenity BDD CLI jar download.
 *
 * @package
 */
export class ProgressReporter implements StageCrewMember {
    constructor(
        private readonly printer: Printer,
        private readonly stage?: Stage,
        private progressBar?: ProgressBar,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new ProgressReporter(this.printer, stage, this.progressBar);
    }

    notifyOf(event: DomainEvent): void {
        if (event instanceof ArtifactGenerated && event.artifact instanceof DownloadProgressReport) {
            const { downloadedBytes, totalBytes } = event.artifact.map(report => report) as { downloadedBytes: number, totalDownloadedBytes: number, totalBytes: number };

            if (! this.progressBar) {
                this.progressBar = new ProgressBar(`[:bar] Downloaded :percent at :ratebps. We should be done in about :etas`, {
                    complete: '=',
                    incomplete: '-',
                    width: 20,
                    total: totalBytes,
                    stream: this.printer.out,
                });
            }

            this.progressBar.tick(downloadedBytes);
        }
    }
}
