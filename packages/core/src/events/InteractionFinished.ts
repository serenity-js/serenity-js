import { JSONObject } from 'tiny-types';

import { ActivityDetails, Outcome, SerialisedOutcome, Timestamp } from '../model';
import { ActivityFinished } from './ActivityFinished';

export class InteractionFinished extends ActivityFinished {
    static fromJSON(o: JSONObject) {
        return new InteractionFinished(
            ActivityDetails.fromJSON(o.value as JSONObject),
            Outcome.fromJSON(o.outcome as SerialisedOutcome),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }
}
