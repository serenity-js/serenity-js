import { ensure, isDefined, Serialised } from 'tiny-types';

import { ScenarioDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneStarts extends DomainEvent {
    static fromJSON(o: Serialised<SceneStarts>) {
        return new SceneStarts(
            ScenarioDetails.fromJSON(o.value as Serialised<ScenarioDetails>),
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
