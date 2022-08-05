import { Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

/**
 * Emitted when all the test scenarios have finished running.
 *
 * @group Events
 */
export class TestRunFinished extends DomainEvent {
    static fromJSON(v: string): TestRunFinished {
        return new TestRunFinished(
            Timestamp.fromJSON(v as string),
        );
    }

    constructor(timestamp?: Timestamp) {
        super(timestamp);
    }
}
