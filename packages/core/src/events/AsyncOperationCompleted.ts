import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { CorrelationId } from '../model/index.js';
import { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

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
