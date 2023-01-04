import { ensure, isDefined, JSONObject } from 'tiny-types';

import { CorrelationId, Description, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

/**
 * @group Events
 */
export class AsyncOperationAborted extends DomainEvent {
    static fromJSON(o: JSONObject): AsyncOperationAborted {
        return new AsyncOperationAborted(
            Description.fromJSON(o.description as string),
            CorrelationId.fromJSON(o.correlationId as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly description: Description,
        public readonly correlationId: CorrelationId,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('description', description, isDefined());
        ensure('correlationId', correlationId, isDefined());
    }
}
