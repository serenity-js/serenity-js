import type { JSONObject } from 'tiny-types';

import { ActivityDetails, CorrelationId } from '../model/index.js';
import { Timestamp } from '../screenplay/index.js';
import { ActivityStarts } from './ActivityStarts.js';

/**
 * Emitted when an [`Interaction`](https://serenity-js.org/api/core/class/Interaction/) starts.
 *
 * @group Events
 */
export class InteractionStarts extends ActivityStarts {
    static fromJSON(o: JSONObject): InteractionStarts {
        return new InteractionStarts(
            CorrelationId.fromJSON(o.sceneId as string),
            CorrelationId.fromJSON(o.activityId as string),
            ActivityDetails.fromJSON(o.details as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }
}
