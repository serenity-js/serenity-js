import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { CorrelationId, Description } from '../model/index.js';
import { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * @group Events
 */
export class SceneTemplateDetected extends DomainEvent {
    public static fromJSON(o: JSONObject): SceneTemplateDetected {
        return new SceneTemplateDetected(
            CorrelationId.fromJSON(o.sceneId as string),
            Description.fromJSON(o.template as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly template: Description,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('template', template, isDefined());
    }
}
