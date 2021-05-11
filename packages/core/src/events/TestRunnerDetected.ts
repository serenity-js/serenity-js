import { ensure, isDefined, JSONObject } from 'tiny-types';

import { CorrelationId, Name, Timestamp } from '../model';
import { DomainEvent } from './DomainEvent';

export class TestRunnerDetected extends DomainEvent {
    public static fromJSON(o: JSONObject): TestRunnerDetected {
        return new TestRunnerDetected(
            CorrelationId.fromJSON(o.sceneId as string),
            Name.fromJSON(o.name as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly name: Name,
        public readonly timestamp: Timestamp = new Timestamp(),
    ) {
        super();
        ensure('sceneId', sceneId, isDefined());
        ensure('name', name, isDefined());
        ensure('timestamp', timestamp, isDefined());
    }
}
