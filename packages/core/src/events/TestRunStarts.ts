import { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * Emitted when the very first test is about to start
 *
 * @group Events
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
