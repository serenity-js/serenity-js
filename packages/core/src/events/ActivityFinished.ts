import { ensure, isDefined } from 'tiny-types';

import { ActivityDetails, CorrelationId, Outcome, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export abstract class ActivityFinished extends DomainEvent {
    constructor(
        public readonly sceneId: CorrelationId,
        public readonly activityId: CorrelationId,
        public readonly details: ActivityDetails,
        public readonly outcome: Outcome,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('activityId', activityId, isDefined());
        ensure('details', details, isDefined());
        ensure('outcome', outcome, isDefined());
    }
}
