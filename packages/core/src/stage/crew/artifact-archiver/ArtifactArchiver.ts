import * as sanitise from 'sanitize-filename';
import { match } from 'tiny-types';

import {
    ArtifactGenerated,
    AsyncOperationAttempted,
    AsyncOperationCompleted,
    AsyncOperationFailed,
    DomainEvent,
} from '../../../events';
import { FileSystem, FileType, Path } from '../../../io';
import { CorrelationId, Description } from '../../../model';
import { StageCrewMember } from '../../StageCrewMember';
import { StageManager } from '../../StageManager';

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

    private handleArtifactGenerated = ({ artifact }: ArtifactGenerated<any>): void => {

        const filename = [
            sanitise(artifact.name.value),
            artifact.type.extesion.value,
        ].join('.');

        const id = CorrelationId.create();

        this.stageManager.notifyOf(new AsyncOperationAttempted(
            new Description(`[${ this.constructor.name }] Saving '${ filename }'...`),
            id,
        ));

        match<FileType, Promise<Path>>(artifact.type)
            .when(FileType.PNG, _  => this.fileSystem.store(new Path(filename), artifact.contents, 'base64'))
            .else(_                => this.fileSystem.store(new Path(filename), JSON.stringify(artifact.contents), 'utf8'))
            .then(path => {
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
