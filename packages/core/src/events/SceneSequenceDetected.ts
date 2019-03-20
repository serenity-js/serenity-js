import { ensure, isDefined, JSONObject } from 'tiny-types';

import { ScenarioDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneSequenceDetected extends DomainEvent {
    static fromJSON(o: JSONObject) {
        return new SceneSequenceDetected(
            ScenarioDetails.fromJSON(o.value as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly value: ScenarioDetails,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
    }
}
