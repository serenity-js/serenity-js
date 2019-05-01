import { ensure, isGreaterThan, property } from 'tiny-types';
import {
    ActivityRelatedArtifactArchived,
    ActivityRelatedArtifactGenerated,
    ArtifactArchived,
    ArtifactGenerated,
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    DomainEvent,
} from '../../../events';
import { FileSystem, Path } from '../../../io';
import { Artifact, ArtifactType, CorrelationId, Description, Photo, TestReport } from '../../../model';
import { Stage } from '../../Stage';
import { StageCrewMember } from '../../StageCrewMember';
import { MD5Hash } from './MD5Hash';

/**
 * @desc Stores any {@link Artifact}s emitted through {@link ArtifactGenerated} events on the {@link FileSystem}
 *
 * @access public
 */
export class ArtifactArchiver implements StageCrewMember {

    static storingArtifactsAt(...destination: string[]): ArtifactArchiver {
        ensure('Path to destination directory', destination, property('length', isGreaterThan(0)));

        const pathToDestination = destination.map(segment => new Path(segment)).reduce((acc, current) => acc.join(current));

        return new ArtifactArchiver(new FileSystem(pathToDestination));
    }

    constructor(
        private readonly fileSystem: FileSystem,
        private readonly stage: Stage = null,
    ) {
    }

    assignedTo(stage: Stage) {
        return new ArtifactArchiver(this.fileSystem, stage);
    }

    notifyOf(event: DomainEvent): void {

        if (! (event instanceof ArtifactGenerated)) {
            // ignore any other events
            return void 0;
        }

        if (event.artifact instanceof Photo) {
            const relativePath = new Path(`photo-${ this.hashOf(event.artifact) }.png`);

            this.archive(
                relativePath,
                event.artifact.base64EncodedValue,
                'base64',
                this.archivisationAnnouncement(event, relativePath),
            );
        }

        if (event.artifact instanceof TestReport) {
            const relativePath = new Path(`scenario-report-${ this.hashOf(event.artifact) }.json`);

            this.archive(
                relativePath,
                event.artifact.map(JSON.stringify),
                'utf8',
                this.archivisationAnnouncement(event, relativePath),
            );
        }
    }

    private hashOf(artifact: Artifact): string {
        return MD5Hash.of(artifact.base64EncodedValue).value;
    }

    private archive(relativePath: Path, contents: string, encoding: string, announce: (absolutePath: Path) => void): void {
        const id = CorrelationId.create();

        this.stage.announce(new AsyncOperationAttempted(
            new Description(`[${ this.constructor.name }] Saving '${ relativePath.value }'...`),
            id,
        ));

        this.fileSystem.store(relativePath, contents,  encoding)
            .then(absolutePath => {
                announce(relativePath);

                this.stage.announce(new AsyncOperationCompleted(
                    new Description(`[${ this.constructor.name }] Saved '${ absolutePath.value }'`),
                    id,
                ));
            })
            .catch(error => {
                this.stage.announce(new AsyncOperationFailed(error, id));
            });
    }

    private archivisationAnnouncement(evt: ArtifactGenerated | ActivityRelatedArtifactGenerated, relativePathToArtifact: Path) {
        return (absolutePath: Path) => {
            if (evt instanceof ActivityRelatedArtifactGenerated) {
                this.stage.announce(new ActivityRelatedArtifactArchived(
                    evt.details,
                    evt.name,
                    evt.artifact.constructor as ArtifactType,
                    relativePathToArtifact,
                ));
            }

            if (evt instanceof ArtifactGenerated) {
                this.stage.announce(new ArtifactArchived(
                    evt.name,
                    evt.artifact.constructor as ArtifactType,
                    relativePathToArtifact,
                ));
            }
        };
    }
}
