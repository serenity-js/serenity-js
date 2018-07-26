import { ensure, isDefined, Serialised } from 'tiny-types';

import { Name, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class TestRunnerDetected extends DomainEvent {
    public static fromJSON(o: Serialised<TestRunnerDetected>) {
        return new TestRunnerDetected(
            Name.fromJSON(o.value as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly value: Name,
        public readonly timestamp: Timestamp = new Timestamp(),
    ) {
        super();
        ensure('value', value, isDefined());
        ensure('timestamp', timestamp, isDefined());
    }
}
