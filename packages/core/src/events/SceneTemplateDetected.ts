import { ensure, isDefined, JSONObject } from 'tiny-types';

import { Description, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class SceneTemplateDetected extends DomainEvent {
    public static fromJSON(o: JSONObject) {
        return new SceneTemplateDetected(
            Description.fromJSON(o.template as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly template: Description,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('template', template, isDefined());
    }
}
