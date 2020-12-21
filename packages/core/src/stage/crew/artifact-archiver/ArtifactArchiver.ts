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
import { Artifact, ArtifactType, CorrelationId, Description, Name, Photo, TestReport } from '../../../model';
import { Stage } from '../../Stage';
import { StageCrewMember } from '../../StageCrewMember';
import { Hash } from './Hash';

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

        if (!(event instanceof ArtifactGenerated)) {
            // ignore any other events
            return void 0;
        }

        if (event.artifact instanceof Photo) {
            const filename = this.fileNameFor('photo', event.name, event.artifact, 'png');

            this.archive(
                filename,
                event.artifact.base64EncodedValue,
                'base64',
                this.archivisationAnnouncement(event, filename),
            );
        }

        if (event.artifact instanceof TestReport) {
            const filename = this.fileNameFor('scenario', event.name, event.artifact, 'json');

            this.archive(
                filename,
                event.artifact.map(JSON.stringify),
                'utf8',
                this.archivisationAnnouncement(event, filename),
            );
        }
    }

    private fileNameFor(prefix: string, artifactName: Name, artifact: Artifact, extension: string): Path {
        const hash = Hash.of(artifact.base64EncodedValue).short();

        const urlFriendly = (name: string) =>
            name.toLocaleLowerCase()
                .replace(/[^a-z0-9.-]/g, '-');

        return Path.fromSanitisedString(
            // Ensure that the file name is shorter than 250 chars, which is safe with all the filesystems
            // note: we can't do that in the Path constructor as the Path can be used to join other paths,
            // so restricting the length of the _path_ itself would not be correct.
            `${ prefix.substring(0, 10) }-${ urlFriendly(artifactName.value).substring(0, 64) }-${ hash }.${ extension }`.replace(/-+/g, '-'),
            // characters:     10        1         83                                          1    10   1    4                                 < 100
        );
    }

    private archive(relativePath: Path, contents: string, encoding: string, announce: (absolutePath: Path) => void): void {
        const id = CorrelationId.create();

        this.stage.announce(new AsyncOperationAttempted(
            new Description(`[${ this.constructor.name }] Saving '${ relativePath.value }'...`),
            id,
        ));

        this.fileSystem.store(relativePath, contents, encoding)
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
                    evt.sceneId,
                    evt.activityId,
                    evt.name,
                    evt.artifact.constructor as ArtifactType,
                    relativePathToArtifact,
                ));
            } else if (evt instanceof ArtifactGenerated) {
                this.stage.announce(new ArtifactArchived(
                    evt.sceneId,
                    evt.name,
                    evt.artifact.constructor as ArtifactType,
                    relativePathToArtifact,
                ));
            }
        };
    }
}
