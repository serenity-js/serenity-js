import { ensure, isDefined } from 'tiny-types';

import { ActivityDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export abstract class ActivityStarts extends DomainEvent {
    constructor(
        public readonly value: ActivityDetails,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
    }
}
