import { JSONObject } from 'tiny-types';

import { ActivityDetails, CorrelationId, Outcome, SerialisedOutcome } from '../model';
import { Timestamp } from '../screenplay';
import { ActivityFinished } from './ActivityFinished';

/**
 * @group Events
 */
export class InteractionFinished extends ActivityFinished {
    static fromJSON(o: JSONObject): InteractionFinished {
        return new InteractionFinished(
            CorrelationId.fromJSON(o.sceneId as string),
            CorrelationId.fromJSON(o.activityId as string),
            ActivityDetails.fromJSON(o.details as JSONObject),
            Outcome.fromJSON(o.outcome as SerialisedOutcome),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }
}
