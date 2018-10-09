import * as sanitise from 'sanitize-filename';
import { match } from 'tiny-types';

import {
    ArtifactArchived,
    ArtifactGenerated,
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    DomainEvent,
} from '../../../events';
import { FileSystem, Path } from '../../../io';
import { Artifact, ArtifactType, CorrelationId, Description, JSONData, Photo } from '../../../model';
import { StageCrewMember } from '../../StageCrewMember';
import { StageManager } from '../../StageManager';
import { MD5Hash } from './MD5Hash';

/**
 * @desc Stores any {@link Artifact}s emitted through {@link ArtifactGenerated} events on the {@link FileSystem}
 *
 * @access public
 */
export class ArtifactArchiver implements StageCrewMember {
    private stageManager: StageManager;

    constructor(
        private readonly fileSystem: FileSystem,
    ) {
    }

    assignTo(stageManager: StageManager) {
        this.stageManager = stageManager;
    }

    notifyOf = (event: DomainEvent): void => match<DomainEvent, void>(event)
        .when(ArtifactGenerated, this.handleArtifactGenerated)
        .else(_ => void 0)

    private handleArtifactGenerated = ({ name, artifact }: ArtifactGenerated): void => {

        const filename = [
            sanitise(name.value),
            '-',
            MD5Hash.of(artifact.base64EncodedValue).value,
            match<Artifact, string>(artifact)
                .when(Photo, _ => '.png')
                .when(JSONData, _ => '.json')
                .else(_ => '.out'),
        ].join('');

        const id = CorrelationId.create();

        this.stageManager.notifyOf(new AsyncOperationAttempted(
            new Description(`[${ this.constructor.name }] Saving '${ filename }'...`),
            id,
        ));

        match<Artifact, Promise<Path>>(artifact)
            .when(Photo,    _  => this.fileSystem.store(new Path(filename), artifact.base64EncodedValue,  'base64'))
            .when(JSONData, _  => this.fileSystem.store(new Path(filename), artifact.map(JSON.stringify), 'utf8'))
            .else(_            => this.fileSystem.store(new Path(filename), artifact.map(data => data),   'utf8'))
            .then(path => {

                this.stageManager.notifyOf(new ArtifactArchived(
                    name,
                    artifact.constructor as ArtifactType,
                    path,
                ));

                this.stageManager.notifyOf(new AsyncOperationCompleted(
                    new Description(`[${ this.constructor.name }] Saved '${ path.value }'`),
                    id,
                ));
            })
            .catch(error => {
                this.stageManager.notifyOf(new AsyncOperationFailed(error, id));
            });
    }
}
