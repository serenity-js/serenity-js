import { ensure, isDefined, JSONObject } from 'tiny-types';

import { CorrelationId, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

/**
 * @group Events
 */
export class AsyncOperationCompleted extends DomainEvent {
    static fromJSON(o: JSONObject): AsyncOperationCompleted {
        return new AsyncOperationCompleted(
            CorrelationId.fromJSON(o.correlationId as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly correlationId: CorrelationId,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('correlationId', correlationId, isDefined());
    }
}
