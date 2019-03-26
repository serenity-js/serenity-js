import { JSONObject } from 'tiny-types';

import { ActivityDetails, Outcome, SerialisedOutcome, Timestamp } from '../model';
import { ActivityFinished } from './ActivityFinished';

export class TaskFinished extends ActivityFinished {
    static fromJSON(o: JSONObject) {
        return new TaskFinished(
            ActivityDetails.fromJSON(o.value as JSONObject),
            Outcome.fromJSON(o.outcome as SerialisedOutcome),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }
}
