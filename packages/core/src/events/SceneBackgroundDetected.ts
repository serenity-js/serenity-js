import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { CorrelationId, Description, Name } from '../model/index.js';
import type { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * @group Events
 */
export class SceneBackgroundDetected extends DomainEvent {
    public static fromJSON(o: JSONObject): SceneBackgroundDetected {
        return new SceneBackgroundDetected(
            CorrelationId.fromJSON(o.sceneId as string),
            Name.fromJSON(o.name as string),
            Description.fromJSON(o.description as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly name: Name,
        public readonly description: Description,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('name', name, isDefined());
        ensure('description', description, isDefined());
    }
}
