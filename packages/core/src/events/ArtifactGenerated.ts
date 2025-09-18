import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import type { Artifact, SerialisedArtifact } from '../model';
import { ArtifactDeserialiser, CorrelationId, Name } from '../model';
import { Timestamp } from '../screenplay';
import { DomainEvent } from './DomainEvent';

/**
 * @group Events
 */
export class ArtifactGenerated extends DomainEvent {
    static fromJSON(o: JSONObject): ArtifactGenerated {
        return new ArtifactGenerated(
            CorrelationId.fromJSON(o.sceneId as string),
            Name.fromJSON(o.name as string),
            ArtifactDeserialiser.fromJSON(o.artifact as SerialisedArtifact),
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
