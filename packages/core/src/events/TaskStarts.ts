import { JSONObject } from 'tiny-types';

import { ActivityDetails, Timestamp } from '../model';
import { ActivityStarts } from './ActivityStarts';

export class TaskStarts extends ActivityStarts {
    static fromJSON(o: JSONObject) {
        return new TaskStarts(
            ActivityDetails.fromJSON(o.value as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }
}
