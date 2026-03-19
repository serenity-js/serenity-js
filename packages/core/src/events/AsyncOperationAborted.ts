import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { CorrelationId, Description } from '../model/index.js';
import { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

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
