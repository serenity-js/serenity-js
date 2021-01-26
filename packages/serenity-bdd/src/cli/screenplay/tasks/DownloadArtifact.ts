import { AnswersQuestions, PerformsActivities, Task, UsesAbilities } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { GetRequest } from '@serenity-js/rest';
import { URL } from 'url';
import { GAV } from '../../model';
import { CreateDirectory, Notify, StreamResponse } from '../interactions';
import { RenameFile } from '../interactions/RenameFile';
import { VerifyChecksum } from './VerifyChecksum';

/**
 * @package
 */
export class DownloadArtifact extends Task {
    static identifiedBy(artifactIdentifier: GAV) {
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
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Task}.
     *
     * @param {PerformsActivities & UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~PerformsActivities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): PromiseLike<void> | PromiseLike<any> {
        const
            tempFileName        = new Path(`${ this.gav.toPath().value }.download`),
            pathToTempFile      = this.destinationDirectory.join(tempFileName),
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

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor downloads ${ this.gav.toPath().value } from ${ this.repository.toString() }`;
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
