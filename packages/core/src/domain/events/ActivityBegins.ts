import { ensure, isDefined } from 'tiny-types';

import { ActivityDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class ActivityBegins extends DomainEvent {
    constructor(
        public readonly value: ActivityDetails,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
    }
}
