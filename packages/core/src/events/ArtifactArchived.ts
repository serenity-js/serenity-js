import { ensure, isDefined, JSONObject } from 'tiny-types';

import { Path } from '../io';
import { Artifact, ArtifactType, CorrelationId, Name, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class ArtifactArchived extends DomainEvent {
    static fromJSON(o: JSONObject): ArtifactArchived {
        return new ArtifactArchived(
            CorrelationId.fromJSON(o.sceneId as string),
            Name.fromJSON(o.name as string),
            Artifact.ofType(o.type as string),
            Path.fromJSON(o.path as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly name: Name,
        public readonly type: ArtifactType,
        public readonly path: Path,
        timestamp?: Timestamp,
    ) {
        super(timestamp);

        ensure('sceneId', sceneId, isDefined());
        ensure('name', name, isDefined());
        ensure('type', type, isDefined());
        ensure('path', path, isDefined());
    }

    toJSON(): JSONObject {
        return {
            name: this.name.toJSON(),
            type: this.type.name,
            path: this.path.toJSON(),
            timestamp: this.timestamp.toJSON(),
        };
    }
}
