import type { JSONObject } from 'tiny-types';
import { ensure, isDefined } from 'tiny-types';

import { CorrelationId } from '../model/index.js';
import { Timestamp } from '../screenplay/index.js';
import { DomainEvent } from './DomainEvent.js';

/**
 * Indicates that the test runner will retry running the test scenario upon failure.
 *
 * @group Events
 */
export class RetryableSceneDetected extends DomainEvent {

    /**
     * Deserialises the event from a JSONObject
     *
     * @param o
     */
    static fromJSON(o: JSONObject): RetryableSceneDetected {
        return new RetryableSceneDetected(
            CorrelationId.fromJSON(o.sceneId as string),
            Timestamp.fromJSON(o.timestamp as string),
        );
    }

    /**
     * @param sceneId
     * @param [timestamp]
     */
    constructor(
        public readonly sceneId: CorrelationId,
        timestamp?: Timestamp,
    ) {
        super(timestamp);
        ensure('sceneId', sceneId, isDefined());
    }
}
