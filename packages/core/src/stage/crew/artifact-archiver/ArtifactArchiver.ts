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
import { Artifact, ArtifactType, CorrelationId, Description, JSONData, Name, Photo, TestReport } from '../../../model';
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
        .when(ArtifactGenerated, (e: ArtifactGenerated) => match<Artifact, void>(e.artifact)
            .when(Photo,        (photo: Photo)           => this.archivePhoto(e.name, photo))
            .when(TestReport,   (testReport: TestReport) => this.archiveTestReport(e.name, testReport))
            .else(_ => void 0),
        )
        .else(_ => void 0)

    private archivePhoto(name: Name, photo: Photo) {
        this.archive(
            photo.constructor as ArtifactType,
            name,
            new Path(`${ sanitise(name.value) }-${ this.hashOf(photo) }.png`),
            photo.base64EncodedValue,
            'base64',
        );
    }

    private archiveTestReport(name: Name, report: TestReport) {
        this.archive(
            report.constructor as ArtifactType,
            name,
            new Path(`${ sanitise(name.value) }-${ this.hashOf(report) }.json`),
            report.map(JSON.stringify),
            'utf8',
        );
    }

    private hashOf(artifact: Artifact): string {
        return MD5Hash.of(artifact.base64EncodedValue).value;
    }

    private archive(type: ArtifactType, name: Name, path: Path, contents: string, encoding: string): void {
        const id = CorrelationId.create();

        this.stageManager.notifyOf(new AsyncOperationAttempted(
            new Description(`[${ this.constructor.name }] Saving '${ path.value }'...`),
            id,
        ));

        this.fileSystem.store(path, contents,  encoding)
            .then(savedPath => {
                this.stageManager.notifyOf(new ArtifactArchived(
                    name,
                    type,
                    path,
                ));

                this.stageManager.notifyOf(new AsyncOperationCompleted(
                    new Description(`[${ this.constructor.name }] Saved '${ savedPath.value }'`),
                    id,
                ));
            })
            .catch(error => {
                this.stageManager.notifyOf(new AsyncOperationFailed(error, id));
            });
    }
}
