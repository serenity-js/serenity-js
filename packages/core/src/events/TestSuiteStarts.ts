import { ensure, isDefined, JSONObject } from 'tiny-types';

import { TestSuiteDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class TestSuiteStarts extends DomainEvent {
    static fromJSON(o: JSONObject) {
        return new TestSuiteStarts(
            TestSuiteDetails.fromJSON(o.value as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly value: TestSuiteDetails,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('value', value, isDefined());
    }
}
