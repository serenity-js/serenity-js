import { ensure, isDefined, Serialised } from 'tiny-types';

import { Description } from '../model';
import { DomainEvent } from './DomainEvent';

export class FeatureNarrativeDetected extends DomainEvent {
    public static fromJSON(o: Serialised<FeatureNarrativeDetected>) {
        return new FeatureNarrativeDetected(
            Description.fromJSON(o.description as string),
        );
    }

    constructor(
        public readonly description: Description,
    ) {
        super();
        ensure('description', description, isDefined());
    }
}
