import { ensure, isDefined, JSONObject } from 'tiny-types';

import { ScenarioDetails, ScenarioParameters } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneParametersDetected extends DomainEvent {
    public static fromJSON(o: JSONObject) {
        return new SceneParametersDetected(
            ScenarioDetails.fromJSON(o.scenario as JSONObject),
            ScenarioParameters.fromJSON(o.value as JSONObject),
        );
    }

    constructor(
        public readonly scenario: ScenarioDetails,
        public readonly value: ScenarioParameters,
    ) {
        super();
        ensure('value', value, isDefined());
    }
}
