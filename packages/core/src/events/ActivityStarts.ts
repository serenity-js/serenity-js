import { ensure, isDefined, Serialised } from 'tiny-types';

import { ActivityDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class ActivityStarts extends DomainEvent {
    static fromJSON(o: Serialised<ActivityStarts>) {
        return new ActivityStarts(
            ActivityDetails.fromJSON(o.value as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly value: ActivityDetails,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
    }
}
