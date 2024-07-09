import type { AnswersQuestions, PerformsActivities, UsesAbilities } from '@serenity-js/core';
import { Task } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { GetRequest } from '@serenity-js/rest';
import type { URL } from 'url';

import type { GAV } from '../../model';
import { CreateDirectory, Notify, StreamResponse } from '../interactions';
import { RenameFile } from '../interactions/RenameFile';
import { VerifyChecksum } from './VerifyChecksum';

/**
 * @package
 */
export class DownloadArtifact extends Task {
    static identifiedBy(artifactIdentifier: GAV) {  // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
        return {
            availableFrom: (repository: URL) => ({
                to: (destinationDirectory: Path) => new DownloadArtifact(artifactIdentifier, repository, destinationDirectory),
            }),
        };
    }

    constructor(
        private readonly gav: GAV,
        private readonly repository: URL,
        private readonly destinationDirectory: Path,
    ) {
        super(`#actor downloads ${ gav.toPath().value } from ${ repository.toString() }`);
    }

    /**
     * Makes the provided [`Actor`](https://serenity-js.org/api/core/class/Actor/)
     * perform this [`Task`](https://serenity-js.org/api/core/class/Task/).
     */
    performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): Promise<void> | Promise<any> {
        const
            tempFileName        = new Path(`${ this.gav.toPath().value }.download`),    // eslint-disable-line unicorn/prevent-abbreviations
            pathToTempFile      = this.destinationDirectory.join(tempFileName),         // eslint-disable-line unicorn/prevent-abbreviations
            pathToFinishedFile  = this.destinationDirectory.join(this.gav.toPath());

        return actor.attemptsTo(
            Notify.that(`Looks like you need the latest Serenity BDD CLI jar. Let me download it for you...`),
            CreateDirectory.at(this.destinationDirectory),
            StreamResponse
                .to(GetRequest.to(this.artifactUrl()))
                .to(pathToTempFile),
            Notify.that(`Verifying checksums...`),
            VerifyChecksum.at(this.artifactUrl() + '.sha1').against(pathToTempFile).calculatedUsing('sha1'),
            RenameFile.from(pathToTempFile).to(pathToFinishedFile),
            Notify.that(`Downloaded ${ pathToFinishedFile.value }`),
        );
    }

    private artifactUrl() {
        return [
            this.repository.toString().replace(/\/+$/, ''),
            ...this.gav.groupId.split('.'),
            this.gav.artifactId,
            this.gav.version,
            this.gav.toPath().value,
        ].join('/');
    }
}
