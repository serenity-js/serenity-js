import type { JSONObject } from 'tiny-types';

import type { SerialisedOutcome } from '../model/index.js';
import { Outcome } from '../model/index.js';
import { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * Emitted when all the test scenarios have finished running.
 *
 * @group Events
 */
export class TestRunFinished extends DomainEvent {
    static fromJSON(o: JSONObject): TestRunFinished {
        return new TestRunFinished(
            Outcome.fromJSON(o.outcome as SerialisedOutcome),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly outcome: Outcome,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
    }
}
