import { AnswersQuestions, PerformsActivities, Task, UsesAbilities } from '@serenity-js/core';
import { Path } from '@serenity-js/core/lib/io';
import { GetRequest } from '@serenity-js/rest';
import { AxiosRequestConfig } from 'axios';
import { resolve, URL } from 'url';
import { GAV } from '../../model';
import { CreateDirectory, Notify, StreamResponse } from '../interactions';
import { RenameFile } from '../interactions/RenameFile';

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
        private readonly config?: AxiosRequestConfig,
    ) {
        super();
    }

    using(config: AxiosRequestConfig): DownloadArtifact {
        return new DownloadArtifact(this.gav, this.repository, this.destinationDirectory, config);
    }

    performAs(actor: PerformsActivities & UsesAbilities & AnswersQuestions): PromiseLike<void> | PromiseLike<any> {
        const
            tempFileName        = new Path(`${ this.gav.toPath().value }.download`),
            pathToTempFile      = this.destinationDirectory.join(tempFileName),
            pathToFinishedFile  = this.destinationDirectory.join(this.gav.toPath());

        return actor.attemptsTo(
            Notify.that(`Looks like you need the latest Serenity BDD CLI jar. Let me download it for you...`),
            CreateDirectory.at(this.destinationDirectory),
            StreamResponse
                .to(GetRequest.to(this.artifactURL()).using(this.config))
                .to(this.destinationDirectory.join(tempFileName)),
            RenameFile.from(pathToTempFile).to(pathToFinishedFile),
            Notify.that(`Downloaded ${ pathToFinishedFile.value }`),
        );
    }

    toString(): string {
        return `#actor downloads ${ this.gav.toPath().value } from ${ this.repository.toString() }`;
    }

    private artifactURL() {
        const path = [
            ...this.gav.groupId.split('.'),
            this.gav.artifactId,
            this.gav.version,
            this.gav.toPath().value,
        ].join('/');

        return resolve(
            this.repository.toString(),
            path,
        );
    }
}
