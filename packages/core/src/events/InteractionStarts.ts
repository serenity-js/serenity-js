import { JSONObject } from 'tiny-types';

import { ActivityDetails, Timestamp } from '../model';
import { ActivityStarts } from './ActivityStarts';

export class InteractionStarts extends ActivityStarts {
    static fromJSON(o: JSONObject) {
        return new InteractionStarts(
            ActivityDetails.fromJSON(o.value as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }
}
