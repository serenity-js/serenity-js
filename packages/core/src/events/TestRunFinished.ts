import { Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class TestRunFinished extends DomainEvent {
    static fromJSON(v: string) {
        return new TestRunFinished(
            Timestamp.fromJSON(v as string),
        );
    }

    constructor(
        timestamp?: Timestamp,
    ) {
        super(timestamp);
    }
}
