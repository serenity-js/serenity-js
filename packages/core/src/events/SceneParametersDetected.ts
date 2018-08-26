import { ensure, isDefined, Serialised } from 'tiny-types';

import { ScenarioDetails, ScenarioParameters } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneParametersDetected extends DomainEvent {
    public static fromJSON(o: Serialised<SceneParametersDetected>) {
        return new SceneParametersDetected(
            ScenarioDetails.fromJSON(o.scenario as Serialised<ScenarioDetails>),
            ScenarioParameters.fromJSON(o.value as Serialised<ScenarioParameters>),
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
