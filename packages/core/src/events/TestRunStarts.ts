import { Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

/**
 * @desc
 *  Emitted when the very first test is about to start
 *
 * @extends {DomainEvent}
 */
export class TestRunStarts extends DomainEvent {
    static fromJSON(v: string): TestRunStarts {
        return new TestRunStarts(
            Timestamp.fromJSON(v as string),
        );
    }

    constructor(timestamp?: Timestamp) {
        super(timestamp);
    }
}
