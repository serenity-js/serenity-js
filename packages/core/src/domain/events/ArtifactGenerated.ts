import { ensure, isDefined } from 'tiny-types';

import { Artifact } from '../../io';
import { Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class ArtifactGenerated<T> extends DomainEvent {
    constructor(
        public readonly artifact: Artifact<T>,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', artifact, isDefined());
    }
}
