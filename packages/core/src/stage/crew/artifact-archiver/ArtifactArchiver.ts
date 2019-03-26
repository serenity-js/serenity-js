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
import { Artifact, ArtifactType, CorrelationId, Description, Name, Photo, TestReport } from '../../../model';
import { Stage } from '../../Stage';
import { StageCrewMember } from '../../StageCrewMember';
import { MD5Hash } from './MD5Hash';

/**
 * @desc Stores any {@link Artifact}s emitted through {@link ArtifactGenerated} events on the {@link FileSystem}
 *
 * @access public
 */
export class ArtifactArchiver implements StageCrewMember {

    constructor(
        private readonly fileSystem: FileSystem,
        private readonly stage: Stage = null,
    ) {
    }

    assignedTo(stage: Stage) {
        return new ArtifactArchiver(this.fileSystem, stage);
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
            new Path(`photo-${ this.hashOf(photo) }.png`),
            photo.base64EncodedValue,
            'base64',
        );
    }

    private archiveTestReport(name: Name, report: TestReport) {
        this.archive(
            report.constructor as ArtifactType,
            name,
            new Path(`scenario-report-${ this.hashOf(report) }.json`),
            report.map(JSON.stringify),
            'utf8',
        );
    }

    private hashOf(artifact: Artifact): string {
        return MD5Hash.of(artifact.base64EncodedValue).value;
    }

    private archive(type: ArtifactType, name: Name, path: Path, contents: string, encoding: string): void {
        const id = CorrelationId.create();

        this.stage.manager.notifyOf(new AsyncOperationAttempted(
            new Description(`[${ this.constructor.name }] Saving '${ path.value }'...`),
            id,
        ));

        this.fileSystem.store(path, contents,  encoding)
            .then(savedPath => {
                this.stage.manager.notifyOf(new ArtifactArchived(
                    name,
                    type,
                    path,
                ));

                this.stage.manager.notifyOf(new AsyncOperationCompleted(
                    new Description(`[${ this.constructor.name }] Saved '${ savedPath.value }'`),
                    id,
                ));
            })
            .catch(error => {
                this.stage.manager.notifyOf(new AsyncOperationFailed(error, id));
            });
    }
 }
