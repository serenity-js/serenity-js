import { ensure, isDefined, JSONObject } from 'tiny-types';

import { CorrelationId, ScenarioDetails, ScenarioParameters, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneParametersDetected extends DomainEvent {
    public static fromJSON(o: JSONObject) {
        return new SceneParametersDetected(
            CorrelationId.fromJSON(o.sceneId as string),
            ScenarioDetails.fromJSON(o.scenario as JSONObject),
            ScenarioParameters.fromJSON(o.value as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly scenario: ScenarioDetails,
        public readonly value: ScenarioParameters,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('value', value, isDefined());
    }
}
