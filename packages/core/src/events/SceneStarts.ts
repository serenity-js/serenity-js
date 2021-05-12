import { ensure, isDefined, JSONObject } from 'tiny-types';

import { CorrelationId, ScenarioDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneStarts extends DomainEvent {
    static fromJSON(o: JSONObject): SceneStarts {
        return new SceneStarts(
            CorrelationId.fromJSON(o.sceneId as string),
            ScenarioDetails.fromJSON(o.details as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly details: ScenarioDetails,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('details', details, isDefined());
    }
}
