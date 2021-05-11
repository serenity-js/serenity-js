import { ensure, isDefined, JSONObject } from 'tiny-types';

import { Path } from '../io';
import { Artifact, ArtifactType, CorrelationId, Name, Timestamp } from '../model';
import { ArtifactArchived } from './ArtifactArchived';

// todo: there should be two types of events here:
//  - ActivityArtifactGenerated
//  - SceneArtifactGenerated
export class ActivityRelatedArtifactArchived extends ArtifactArchived {
    static fromJSON(o: JSONObject): ActivityRelatedArtifactArchived {
        return new ActivityRelatedArtifactArchived(
            CorrelationId.fromJSON(o.sceneId as string),
            CorrelationId.fromJSON(o.activityId as string),
            Name.fromJSON(o.name as string),
            Artifact.ofType(o.type as string),
            Path.fromJSON(o.path as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        sceneId: CorrelationId,
        public readonly activityId: CorrelationId,
        name: Name,
        type: ArtifactType,
        path: Path,
        timestamp?: Timestamp,
    ) {
        super(sceneId, name, type, path, timestamp);
        ensure('activityId', activityId, isDefined());
    }

    toJSON(): JSONObject {
        return {
            sceneId: this.sceneId.toJSON(),
            activityId: this.activityId.toJSON(),
            name: this.name.toJSON(),
            type: this.type.name,
            path: this.path.toJSON(),
            timestamp: this.timestamp.toJSON(),
        };
    }
}
