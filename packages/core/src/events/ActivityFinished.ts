import { ensure, isDefined } from 'tiny-types';

import type { ActivityDetails, CorrelationId, Outcome } from '../model/index.js';
import type { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * Emitted when an [`Activity`](https://serenity-js.org/api/core/class/Activity/) is finished.
 *
 * @group Events
 */
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
