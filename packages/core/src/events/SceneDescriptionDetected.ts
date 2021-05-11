import { ensure, isDefined, JSONObject } from 'tiny-types';

import { CorrelationId, Description, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneDescriptionDetected extends DomainEvent {
    public static fromJSON(o: JSONObject): SceneDescriptionDetected {
        return new SceneDescriptionDetected(
            CorrelationId.fromJSON(o.sceneId as string),
            Description.fromJSON(o.description as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly description: Description,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('description', description, isDefined());
    }
}
