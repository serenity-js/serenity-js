import { Serialised } from 'tiny-types';
import { CorrelationId, Description, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class AsyncOperationAttempted extends DomainEvent {
    static fromJSON(o: Serialised<AsyncOperationAttempted>) {
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
    }
}
