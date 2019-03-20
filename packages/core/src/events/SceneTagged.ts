import { ensure, isDefined, JSONObject } from 'tiny-types';

import { ScenarioDetails, Tag, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneTagged extends DomainEvent {
    static fromJSON(o: JSONObject) {
        return new SceneTagged(
            ScenarioDetails.fromJSON(o.value as JSONObject),
            Tag.fromJSON(o.tag as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }
    constructor(
        public readonly value: ScenarioDetails,
        public readonly tag: Tag,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
    }
}
