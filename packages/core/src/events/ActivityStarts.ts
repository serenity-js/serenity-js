import { ensure, isDefined } from 'tiny-types';

import type { ActivityDetails, CorrelationId } from '../model/index.js';
import type { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * Emitted when an [`Activity`](https://serenity-js.org/api/core/class/Activity/) starts.
 *
 * @group Events
 */
export abstract class ActivityStarts extends DomainEvent {
    constructor(
        public readonly sceneId: CorrelationId,
        public readonly activityId: CorrelationId,
        public readonly details: ActivityDetails,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('activityId', activityId, isDefined());
        ensure('details', details, isDefined());
    }
}
