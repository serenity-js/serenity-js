import { ensure, isDefined, JSONObject } from 'tiny-types';

import { CorrelationId, Description, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class AsyncOperationAttempted extends DomainEvent {
    static fromJSON(o: JSONObject): AsyncOperationAttempted {
        return new AsyncOperationAttempted(
            Description.fromJSON(o.taskDescription as string),
            CorrelationId.fromJSON(o.correlationId as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly taskDescription: Description,
        public readonly correlationId: CorrelationId,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('taskDescription', taskDescription, isDefined());
        ensure('correlationId', correlationId, isDefined());
    }
}
