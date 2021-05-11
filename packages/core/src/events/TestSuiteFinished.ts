import { ensure, isDefined, JSONObject } from 'tiny-types';

import { Outcome, SerialisedOutcome, TestSuiteDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class TestSuiteFinished extends DomainEvent {
    static fromJSON(o: JSONObject): TestSuiteFinished {
        return new TestSuiteFinished(
            TestSuiteDetails.fromJSON(o.details as JSONObject),
            Outcome.fromJSON(o.outcome as SerialisedOutcome),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly details: TestSuiteDetails,
        public readonly outcome: Outcome,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('details', details, isDefined());
        ensure('outcome', outcome, isDefined());
    }
}
