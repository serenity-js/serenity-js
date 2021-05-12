import { ensure, isDefined, JSONObject } from 'tiny-types';

import { Artifact, CorrelationId, Name, SerialisedArtifact, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class ArtifactGenerated extends DomainEvent {
    static fromJSON(o: JSONObject): ArtifactGenerated {
        return new ArtifactGenerated(
            CorrelationId.fromJSON(o.sceneId as string),
            Name.fromJSON(o.name as string),
            Artifact.fromJSON(o.artifact as SerialisedArtifact),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly name: Name,
        public readonly artifact: Artifact,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('name', name, isDefined());
        ensure('artifact', artifact, isDefined());
    }
}
