import { Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

/**
 * @desc
 *  Emitted when all the tests have finished running.
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
