import { ensure, isDefined, JSONObject } from 'tiny-types';

import { ScenarioDetails, ScenarioParameters, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneParametersDetected extends DomainEvent {
    public static fromJSON(o: JSONObject) {
        return new SceneParametersDetected(
            ScenarioDetails.fromJSON(o.scenario as JSONObject),
            ScenarioParameters.fromJSON(o.value as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly scenario: ScenarioDetails,
        public readonly value: ScenarioParameters,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
    }
}
