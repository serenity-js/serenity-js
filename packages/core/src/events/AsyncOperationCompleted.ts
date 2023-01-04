import { ensure, isDefined, JSONObject } from 'tiny-types';

import { CorrelationId, Description, Name, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

/**
 * @group Events
 */
export class AsyncOperationCompleted extends DomainEvent {
    static fromJSON(o: JSONObject): AsyncOperationCompleted {
        return new AsyncOperationCompleted(
            Name.fromJSON(o.name as string),
            Description.fromJSON(o.description as string),
            CorrelationId.fromJSON(o.correlationId as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly name: Name,
        public readonly description: Description,
        public readonly correlationId: CorrelationId,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('description', description, isDefined());
        ensure('correlationId', correlationId, isDefined());
    }
}
