import { JSONObject } from 'tiny-types';

import { ActivityDetails, CorrelationId, Timestamp } from '../model';
import { ActivityStarts } from './ActivityStarts';

export class TaskStarts extends ActivityStarts {
    static fromJSON(o: JSONObject): TaskStarts {
        return new TaskStarts(
            CorrelationId.fromJSON(o.sceneId as string),
            CorrelationId.fromJSON(o.activityId as string),
            ActivityDetails.fromJSON(o.details as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }
}
