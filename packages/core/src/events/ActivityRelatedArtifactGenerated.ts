import { ensure, isDefined, JSONObject } from 'tiny-types';

import { ActivityDetails, Artifact, Name, SerialisedArtifact, Timestamp } from '../model';
import { ArtifactGenerated } from './ArtifactGenerated';

export class ActivityRelatedArtifactGenerated extends ArtifactGenerated {
    static fromJSON(o: JSONObject) {
        return new ActivityRelatedArtifactGenerated(
            ActivityDetails.fromJSON(o.details as JSONObject),
            Name.fromJSON(o.name as string),
            Artifact.fromJSON(o.artifact as SerialisedArtifact),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly details: ActivityDetails,
        name: Name,
        artifact: Artifact,
        timestamp?: Timestamp,
    ) {
        super(name, artifact, timestamp);
        ensure('details', details, isDefined());
    }
}
