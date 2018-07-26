import { ensure, isDefined, Serialised } from 'tiny-types';

import { Outcome, ScenarioDetails, SerialisedOutcome, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneFinished extends DomainEvent {
    static fromJSON(o: Serialised<SceneFinished>) {
        return new SceneFinished(
            ScenarioDetails.fromJSON(o.value as Serialised<ScenarioDetails>),
            Outcome.fromJSON(o.outcome as SerialisedOutcome),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly value: ScenarioDetails,
        public readonly outcome: Outcome,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
        ensure('outcome', outcome, isDefined());
    }
}
