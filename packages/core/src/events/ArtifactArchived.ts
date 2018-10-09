import { ensure, isDefined, JSONObject } from 'tiny-types';

import { Path } from '../io';
import { Artifact, ArtifactType, Name, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export interface SerialisedArtifactArchived extends JSONObject {
    name:      string;
    type:      string;
    path:      string;
    timestamp: string;
}

export class ArtifactArchived extends DomainEvent {
    static fromJSON<E>(o: SerialisedArtifactArchived) {
        return new ArtifactArchived(
            Name.fromJSON(o.name),
            Artifact.ofType(o.type),
            Path.fromJSON(o.path),
            Timestamp.fromJSON(o.timestamp),
        );
    }

    constructor(
        public readonly name: Name,
        public readonly type: ArtifactType,
        public readonly path: Path,
        timestamp?: Timestamp,
    ) {
        super(timestamp);

        ensure('name', name, isDefined());
        ensure('type', type, isDefined());
        ensure('path', path, isDefined());
    }
}
