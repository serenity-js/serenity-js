import * as sanitise from 'sanitize-filename';
import { match } from 'tiny-types';

import { ArtifactGenerated, AsyncOperationAttempted, DomainEvent } from '../../../domain';
import { FileSystem, FileType, Path } from '../../../io';
import { StageCrewMember } from '../../StageCrewMember';
import { StageManager } from '../../StageManager';

export class ArtifactArchiver implements StageCrewMember {
    private stageManager: StageManager;

    constructor(
        private readonly fileSystem: FileSystem,
    ) {
    }

    assignTo(stageManager: StageManager) {
        this.stageManager = stageManager;
        this.stageManager.register(this);
    }

    notifyOf = (event: DomainEvent): void => match<DomainEvent, void>(event)
        .when(ArtifactGenerated, this.handleArtifactGenerated)
        .else(_ => void 0)

    private handleArtifactGenerated = ({ artifact }: ArtifactGenerated<any>): void => {

        const filename = [
            sanitise(artifact.name.value),
            artifact.type.extesion.value,
        ].join('.');

        const promise = match<FileType, Promise<any>>(artifact.type)
            .when(FileType.PNG, _  => this.fileSystem.store(new Path(filename), artifact.contents, 'base64'))
            .else(_                => this.fileSystem.store(new Path(filename), JSON.stringify(artifact.contents), 'utf8'));

        this.stageManager.notifyOf(new AsyncOperationAttempted(
            ArtifactArchiver,
            `save '${ filename }'`,
            promise.then(_ => void 0),
        ));
    }
}
