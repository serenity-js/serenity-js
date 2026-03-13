import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { CorrelationId, Description, Name } from '../model/index.js';
import { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * @group Events
 */
export class AsyncOperationAttempted extends DomainEvent {
    static fromJSON(o: JSONObject): AsyncOperationAttempted {
        return new AsyncOperationAttempted(
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
        ensure('name', name, isDefined());
        ensure('description', description, isDefined());
        ensure('correlationId', correlationId, isDefined());
    }
}
