import { ensure, isDefined, JSONObject } from 'tiny-types';

import { Artifact, Name, SerialisedArtifact, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class ArtifactGenerated extends DomainEvent {
    static fromJSON(o: JSONObject) {
        return new ArtifactGenerated(
            Name.fromJSON(o.name as string),
            Artifact.fromJSON(o.artifact as SerialisedArtifact),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly name: Name,
        public readonly artifact: Artifact,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', artifact, isDefined());
    }
}
