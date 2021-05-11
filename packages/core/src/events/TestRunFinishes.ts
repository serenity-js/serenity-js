import { Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

/**
 * @desc
 *  Emitted when the last test in the test suite has finished running
 *  and it's time for any last-minute reporting to take place.
 */
export class TestRunFinishes extends DomainEvent {
    static fromJSON(v: string): TestRunFinishes {
        return new TestRunFinishes(
            Timestamp.fromJSON(v as string),
        );
    }

    constructor(timestamp?: Timestamp) {
        super(timestamp);
    }
}
