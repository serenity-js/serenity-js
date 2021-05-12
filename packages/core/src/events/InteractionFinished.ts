import { JSONObject } from 'tiny-types';

import { ActivityDetails, CorrelationId, Outcome, SerialisedOutcome, Timestamp } from '../model';
import { ActivityFinished } from './ActivityFinished';

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
