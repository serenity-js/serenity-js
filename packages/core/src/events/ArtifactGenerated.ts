import { ensure, isDefined, Serialised } from 'tiny-types';

import { Artifact } from '../io';
import { Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class ArtifactGenerated<T> extends DomainEvent {
    static fromJSON<E>(o: Serialised<ArtifactGenerated<E>>) {
        return new ArtifactGenerated(
            Artifact.fromJSON(o.artifact as Serialised<Artifact<E>>),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly artifact: Artifact<T>,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', artifact, isDefined());
    }
}
