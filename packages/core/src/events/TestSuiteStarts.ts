import { ensure, isDefined, JSONObject } from 'tiny-types';

import { TestSuiteDetails, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class TestSuiteStarts extends DomainEvent {
    static fromJSON(o: JSONObject): TestSuiteStarts {
        return new TestSuiteStarts(
            TestSuiteDetails.fromJSON(o.details as JSONObject),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly details: TestSuiteDetails,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('details', details, isDefined());
    }
}
