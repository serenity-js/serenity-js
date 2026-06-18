import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { Version } from '../io/index.js';
import { CorrelationId, Name } from '../model/index.js';
import { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * @group Events
 */
export class TestRunnerDetected extends DomainEvent {
    public static fromJSON(o: JSONObject): TestRunnerDetected {
        return new TestRunnerDetected(
            CorrelationId.fromJSON(o.sceneId as string),
            Name.fromJSON(o.name as string),
            Version.fromJSON(o.version as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    constructor(
        public readonly sceneId: CorrelationId,
        public readonly name: Name,
        public readonly version: Version,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
        ensure('name', name, isDefined());
        ensure('version', version, isDefined());
    }
}
