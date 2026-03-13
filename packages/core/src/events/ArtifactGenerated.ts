import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import type { SerialisedArtifact } from '../model/index.js';
import { Artifact, CorrelationId, Name } from '../model/index.js';
import { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * @group Events
 */
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
