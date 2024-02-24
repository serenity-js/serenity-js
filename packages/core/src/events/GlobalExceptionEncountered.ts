import type { JSONObject } from 'tiny-types';

import type { SerialisedOutcome } from '../model';
import { Outcome } from '../model';
import { Timestamp } from '../screenplay';
import { DomainEvent } from './DomainEvent';

/**
 * Emitted when the last test in the test suite has finished running
 * and it's time for any last-minute reporting activities to take place.
 *
 * @group Events
 */
export class GlobalExceptionEncountered extends DomainEvent {
    static fromJSON(o: JSONObject): GlobalExceptionEncountered {
        return new GlobalExceptionEncountered(
            Outcome.fromJSON(o.error as SerialisedOutcome),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly error: Outcome,
        timestamp?: Timestamp
    ) {
        super(timestamp);
    }
}