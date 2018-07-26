import { ensure, isDefined, Serialised } from 'tiny-types';

import { ScenarioDetails, Tag, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneTagged extends DomainEvent {
    static fromJSON(o: Serialised<SceneTagged>) {
        return new SceneTagged(
            ScenarioDetails.fromJSON(o.value as Serialised<ScenarioDetails>),
            Tag.fromJSON(o.tag as Serialised<Tag>),
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
