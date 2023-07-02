import type { JSONObject } from 'tiny-types';

import { ActivityDetails, CorrelationId } from '../model';
import { Timestamp } from '../screenplay';
import { ActivityStarts } from './ActivityStarts';

/**
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
