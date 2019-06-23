import { ensure, isDefined, JSONObject } from 'tiny-types';

import { Path } from '../io';
import { ActivityDetails, Artifact, ArtifactType, Name, Timestamp } from '../model';
import { ArtifactArchived } from './ArtifactArchived';

export class ActivityRelatedArtifactArchived extends ArtifactArchived {
    static fromJSON<E>(o: JSONObject) {
        return new ActivityRelatedArtifactArchived(
            ActivityDetails.fromJSON(o.details as JSONObject),
            Name.fromJSON(o.name as string),
            Artifact.ofType(o.type as string),
            Path.fromJSON(o.path as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly details: ActivityDetails,
        name: Name,
        type: ArtifactType,
        path: Path,
        timestamp?: Timestamp,
    ) {
        super(name, type, path, timestamp);
        ensure('details', details, isDefined());
    }

    toJSON(): JSONObject {
        return {
            details: this.details.toJSON(),
            name: this.name.toJSON(),
            type: this.type.name,
            path: this.path.toJSON(),
            timestamp: this.timestamp.toJSON(),
        };
    }
}
