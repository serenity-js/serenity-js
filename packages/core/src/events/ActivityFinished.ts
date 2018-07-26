import { ensure, isDefined, Serialised } from 'tiny-types';

import { ActivityDetails, Outcome, SerialisedOutcome, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class ActivityFinished extends DomainEvent {
    static fromJSON(o: Serialised<ActivityFinished>) {
        return new ActivityFinished(
            ActivityDetails.fromJSON(o.value as string),
            Outcome.fromJSON(o.outcome as SerialisedOutcome),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly value: ActivityDetails,
        public readonly outcome: Outcome,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
        ensure('outcome', outcome, isDefined());
    }
}
