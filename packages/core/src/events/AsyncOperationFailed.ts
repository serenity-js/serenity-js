import { ensure, isDefined, JSONObject } from 'tiny-types';
import { ErrorSerialiser } from '../io';
import { CorrelationId, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class AsyncOperationFailed extends DomainEvent {
    static fromJSON(o: JSONObject) {
        return new AsyncOperationFailed(
            ErrorSerialiser.deserialise(o.error as string),
            CorrelationId.fromJSON(o.correlationId as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly error: Error,
        public readonly correlationId: CorrelationId,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('error', error, isDefined());
        ensure('correlationId', correlationId, isDefined());
    }

    toJSON() {
        return {
            correlationId: this.correlationId.toJSON(),
            error: ErrorSerialiser.serialise(this.error),
            timestamp: this.timestamp.toJSON(),
        };
    }
}
