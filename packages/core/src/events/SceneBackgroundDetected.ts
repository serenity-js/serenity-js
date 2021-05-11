import { ensure, isDefined, JSONObject } from 'tiny-types';

import { CorrelationId, Description, Name } from '../model';
import { DomainEvent } from './DomainEvent';

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
    ) {
        super();
        ensure('sceneId', sceneId, isDefined());
        ensure('name', name, isDefined());
        ensure('description', description, isDefined());
    }
}
