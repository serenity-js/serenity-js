import { ensure, isDefined } from 'tiny-types';

import { ActivityDetails, Outcome, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export abstract class ActivityFinished extends DomainEvent {
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
