import { ensure, isDefined } from 'tiny-types';

import { ActivityDetails, CorrelationId, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export abstract class ActivityStarts extends DomainEvent {
    constructor(
        public readonly activityId: CorrelationId,
        public readonly details: ActivityDetails,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('activityId', activityId, isDefined());
        ensure('details', details, isDefined());
    }
}
