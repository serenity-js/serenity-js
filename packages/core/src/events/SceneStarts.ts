import { ensure, isDefined, JSONObject } from 'tiny-types';

import { ScenarioDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneStarts extends DomainEvent {
    static fromJSON(o: JSONObject) {
        return new SceneStarts(
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
