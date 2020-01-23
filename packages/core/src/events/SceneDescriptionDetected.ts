import { ensure, isDefined, JSONObject } from 'tiny-types';

import { Description, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneDescriptionDetected extends DomainEvent {
    public static fromJSON(o: JSONObject) {
        return new SceneDescriptionDetected(
            Description.fromJSON(o.description as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly description: Description,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('description', description, isDefined());
    }
}
