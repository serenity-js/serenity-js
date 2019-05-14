import { ensure, isDefined, JSONObject } from 'tiny-types';

import { Outcome, SerialisedOutcome, TestSuiteDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class TestSuiteFinished extends DomainEvent {
    static fromJSON(o: JSONObject) {
        return new TestSuiteFinished(
            TestSuiteDetails.fromJSON(o.value as JSONObject),
            Outcome.fromJSON(o.outcome as SerialisedOutcome),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly value: TestSuiteDetails,
        public readonly outcome: Outcome,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
        ensure('outcome', outcome, isDefined());
    }
}
